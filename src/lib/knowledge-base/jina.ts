import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { env } from '@/env.mjs';


interface VersionInfo {
	timestamp: string;
	size: number;
}

interface DocumentMetadata {
	size: number;
	lastModified: string;
	fileType: string;
	embeddingDimension: number;
	processedAt: string;
	previousVersions: VersionInfo[];
	isImage?: boolean;
}

class JinaService {
	private static instance: JinaEmbeddings | null = null;
	private static isInitializing = false;

	private static async getInstance(): Promise<JinaEmbeddings> {
		if (!this.instance && !this.isInitializing) {
			this.isInitializing = true;
			try {
				if (!env.JINA_API_KEY) {
					throw new Error('JINA_API_KEY environment variable is not set');
				}
				this.instance = new JinaEmbeddings({
					apiKey: env.JINA_API_KEY,
					model: env.JINA_MODEL_NAME || "jina-embeddings-v2-base-en"
				});
			} catch (error) {
				console.error('Failed to initialize Jina embeddings:', error);
				throw error;
			} finally {
				this.isInitializing = false;
			}
		}
		return this.instance!;
	}

	static async generateEmbeddings(input: string | { image: string }): Promise<number[]> {
		const embeddings = await this.getInstance();
		try {
			const result = await embeddings.embedQuery(input);
			return result;
		} catch (error) {
			console.error('Failed to generate embeddings:', error);
			throw error;
		}
	}

	static async processDocument(file: File): Promise<{ 
		content: string; 
		embeddings: number[];
		metadata: DocumentMetadata;
	}> {
		try {
			const isImage = file.type.startsWith('image/');
			let content: string;
			let embeddings: number[];

			if (isImage) {
				const arrayBuffer = await file.arrayBuffer();
				const base64 = Buffer.from(arrayBuffer).toString('base64');
				content = base64;
				embeddings = await this.generateEmbeddings({ image: `data:${file.type};base64,${base64}` });
			} else {
				content = await file.text();
				embeddings = await this.generateEmbeddings(content);
			}

			const metadata: DocumentMetadata = {
				size: file.size,
				lastModified: new Date(file.lastModified).toISOString(),
				fileType: file.type,
				embeddingDimension: embeddings.length,
				processedAt: new Date().toISOString(),
				previousVersions: [],
				isImage
			};

			return { content, embeddings, metadata };
		} catch (error) {
			console.error('Failed to process document:', error);
			throw error;
		}
	}

	static async updateDocument(
		file: File, 
		previousMetadata: DocumentMetadata
	): Promise<{ 
		content: string; 
		embeddings: number[];
		metadata: DocumentMetadata;
	}> {
		try {
			const { content, embeddings, metadata } = await this.processDocument(file);
			
			metadata.previousVersions = [
				...(previousMetadata.previousVersions || []),
				{
					timestamp: previousMetadata.processedAt,
					size: previousMetadata.size
				}
			];

			return { content, embeddings, metadata };
		} catch (error) {
			console.error('Failed to update document:', error);
			throw error;
		}
	}
}

export default JinaService;