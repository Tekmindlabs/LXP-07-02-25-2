import { JinaClient } from './jina-client';
import { ProcessedDocument, DocumentMetadata } from './types';
import { DocumentProcessor } from './document-processor';

export class EmbeddingService {
	private static instance: EmbeddingService | null = null;
	private readonly batchSize: number = 32;

	private constructor() {}

	static getInstance(): EmbeddingService {
		if (!this.instance) {
			this.instance = new EmbeddingService();
		}
		return this.instance;
	}

	async embedText(input: string | { image: string }): Promise<number[]> {
		try {
			return await JinaClient.generateEmbeddings(input);
		} catch (error) {
			console.error('Failed to generate embeddings:', error);
			throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async embedChunks(chunks: (string | { image: string })[]): Promise<number[][]> {
		const embeddings: number[][] = [];
		const errors: { chunk: string | { image: string }, error: string }[] = [];
		
		for (let i = 0; i < chunks.length; i += this.batchSize) {
			const batch = chunks.slice(i, i + this.batchSize);
			const batchResults = await Promise.allSettled(
				batch.map(chunk => this.embedText(chunk))
			);

			batchResults.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					embeddings.push(result.value);
				} else {
					const chunk = batch[index];
					const error = result.reason instanceof Error ? result.reason.message : 'Unknown error';
					errors.push({ chunk, error });
					console.error(`Failed to process chunk ${i + index}:`, error);
				}
			});
		}

		if (errors.length > 0) {
			throw new Error(`Failed to process ${errors.length} chunks. First error: ${errors[0].error}`);
		}

		return embeddings;
	}

	async processDocument(file: File): Promise<ProcessedDocument> {
		try {
			const processedDoc = await DocumentProcessor.processDocument(file);
			const chunks = DocumentProcessor.chunkText(processedDoc.content);
			const embeddings = await this.embedChunks(chunks);
			
			return {
				...processedDoc,
				embeddings: embeddings.flat(),
				metadata: {
					...processedDoc.metadata,
					embeddingDimension: embeddings[0]?.length || 0
				}
			};
		} catch (error) {
			console.error('Failed to process document:', error);
			throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async updateDocument(file: File, previousMetadata: DocumentMetadata): Promise<ProcessedDocument> {
		try {
			const processedDoc = await DocumentProcessor.updateDocument(file, previousMetadata);
			const chunks = DocumentProcessor.chunkText(processedDoc.content);
			const embeddings = await this.embedChunks(chunks);
			
			return {
				...processedDoc,
				embeddings: embeddings.flat(),
				metadata: {
					...processedDoc.metadata,
					embeddingDimension: embeddings[0]?.length || 0
				}
			};
		} catch (error) {
			console.error('Failed to update document:', error);
			throw new Error(`Document update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async processDocumentBatch(files: File[]): Promise<ProcessedDocument[]> {
		return Promise.all(files.map(file => this.processDocument(file)));
	}
}

export const embeddingService = EmbeddingService.getInstance();

