import { JinaEmbeddings } from '@langchain/community/embeddings/jina';
import { env } from '@/env.mjs';

// Server-side check
if (typeof window !== 'undefined') {
	throw new Error('🚫 JinaService can only be used on the server side');
}

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
		if (this.instance) {
			return this.instance;
		}

		if (this.isInitializing) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			return this.getInstance();
		}

		this.isInitializing = true;
		try {
			if (!env.JINA_API_KEY) {
				throw new Error('JINA_API_KEY environment variable is not set');
			}

			this.instance = new JinaEmbeddings({
				apiKey: env.JINA_API_KEY,
				model: "jina-clip-v2", // Use the correct model name
				timeout: 30000, // 30 seconds timeout
			});

			// Test the instance with a simple query to ensure it works
			try {
				await this.instance.embedQuery("test");
			} catch (error) {
				console.error('Failed to initialize Jina embeddings:', error);
				this.instance = null;
				throw new Error(`Failed to initialize Jina embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}

			return this.instance;
		} finally {
			this.isInitializing = false;
		}
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
			// Get embeddings instance
			const embeddings = await this.getInstance();

			// Process based on file type
			let content: string;
			if (file.type.startsWith('image/')) {
				try {
					const buffer = await file.arrayBuffer();
					const base64 = Buffer.from(buffer).toString('base64');
					content = `data:${file.type};base64,${base64}`;
					const imageEmbeddings = await embeddings.embedQuery({ image: content });

					return {
						content,
						embeddings: imageEmbeddings,
						metadata: {
							size: file.size,
							lastModified: new Date(file.lastModified).toISOString(),
							fileType: file.type,
							embeddingDimension: imageEmbeddings.length,
							processedAt: new Date().toISOString(),
							previousVersions: [],
							isImage: true
						}
					};
				} catch (error) {
					console.error('Error processing image:', error);
					throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			} else {
				try {
					content = await file.text();
					const textEmbeddings = await embeddings.embedQuery(content);

					return {
						content,
						embeddings: textEmbeddings,
						metadata: {
							size: file.size,
							lastModified: new Date(file.lastModified).toISOString(),
							fileType: file.type,
							embeddingDimension: textEmbeddings.length,
							processedAt: new Date().toISOString(),
							previousVersions: []
						}
					};
				} catch (error) {
					console.error('Error processing text:', error);
					throw new Error(`Failed to process text: ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}
		} catch (error) {
			console.error('Error in JinaService.processDocument:', error);
			throw new Error(
				`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
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
export type { DocumentMetadata, VersionInfo };