import { ProcessedDocument, DocumentMetadata } from './types';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

export class DocumentProcessor {
	private static readonly DEFAULT_CHUNK_SIZE = 1000;
	private static readonly DEFAULT_CHUNK_OVERLAP = 200;
	private static isInitialized = false;

	private static async initialize() {
		if (!this.isInitialized) {
			const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
			pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
			this.isInitialized = true;
		}
	}

	static async extractText(file: File): Promise<string> {
		const fileType = file.type.toLowerCase();
		
		if (fileType === 'application/pdf') {
			await this.initialize();
			const arrayBuffer = await file.arrayBuffer();
			const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
			let text = '';
			
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				text += content.items.map((item: any) => item.str).join(' ') + '\n';
			}
			
			return text.trim();
		}
		
		if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
			const arrayBuffer = await file.arrayBuffer();
			const result = await mammoth.extractRawText({ arrayBuffer });
			return result.value.trim();
		}
		
		return file.text();
	}

	static chunkText(text: string, chunkSize = this.DEFAULT_CHUNK_SIZE, overlap = this.DEFAULT_CHUNK_OVERLAP): string[] {
		const chunks: string[] = [];
		let startIndex = 0;

		while (startIndex < text.length) {
			let endIndex = startIndex + chunkSize;
			
			if (endIndex < text.length) {
				const nextBreak = text.substring(endIndex - 20, endIndex + 20).search(/[.!?]/);
				if (nextBreak !== -1) {
					endIndex = endIndex - 20 + nextBreak + 1;
				}
			}

			chunks.push(text.substring(startIndex, endIndex).trim());
			startIndex = endIndex - overlap;
		}

		return chunks;
	}

	static async processDocument(file: File): Promise<ProcessedDocument> {
		const content = await this.extractText(file);
		const chunks = this.chunkText(content);
		
		const metadata: DocumentMetadata = {
			size: file.size,
			lastModified: new Date(file.lastModified).toISOString(),
			fileType: file.type,
			embeddingDimension: 0, // This will be updated by the embedding service
			processedAt: new Date().toISOString(),
			previousVersions: [],
			chunks: chunks.length
		};

		return {
			content,
			embeddings: [], // This will be updated by the embedding service
			metadata
		};
	}

	static async updateDocument(file: File, previousMetadata: DocumentMetadata): Promise<ProcessedDocument> {
		const content = await this.extractText(file);
		const chunks = this.chunkText(content);
		
		const metadata: DocumentMetadata = {
			...previousMetadata,
			size: file.size,
			lastModified: new Date(file.lastModified).toISOString(),
			processedAt: new Date().toISOString(),
			chunks: chunks.length,
			previousVersions: [
				...previousMetadata.previousVersions,
				{
					timestamp: previousMetadata.lastModified,
					size: previousMetadata.size
				}
			]
		};

		return {
			content,
			embeddings: [], // This will be updated by the embedding service
			metadata
		};
	}

	static async processDocumentBatch(files: File[]): Promise<ProcessedDocument[]> {
		return Promise.all(files.map(file => this.processDocument(file)));
	}
}