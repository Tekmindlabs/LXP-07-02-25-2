import { lanceDbClient } from '../vectorDb/lance';
import { Document, Folder, KnowledgeBase, SearchResult, DocumentMetadata } from './types';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { embeddingService } from './embedding-service';
import { DocumentProcessor } from './document-processor';
import { prisma } from '@/server/db';

export class KnowledgeBaseService {
	private readonly prisma;

	constructor() {
		this.prisma = prisma;
	}


	async getKnowledgeBase(): Promise<KnowledgeBase> {
		const kb = await this.prisma.knowledgeBase.findFirst();
		if (!kb) {
			const newKb = await this.prisma.knowledgeBase.create({
				data: {
					id: nanoid(),
					name: 'Main Knowledge Base',
					description: null,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
			return {
				...newKb,
				description: newKb.description || null
			};
		}
		return {
			...kb,
			description: kb.description || null
		};
	}

	async getFolders(knowledgeBaseId: string): Promise<Folder[]> {
		const folders = await this.prisma.folder.findMany({
			where: { knowledgeBaseId },
			orderBy: { createdAt: 'desc' }
		});
		
		return folders.map(folder => ({
			...folder,
			description: folder.description || null,
			parentId: folder.parentId || null,
			metadata: folder.metadata as Record<string, any> | null
		}));
	}

	async getDocuments(folderId: string, knowledgeBaseId: string): Promise<Document[]> {
		const documents = await this.prisma.document.findMany({
			where: { 
				folderId,
				knowledgeBaseId 
			},
			orderBy: { updatedAt: 'desc' }
		});

		return documents.map(doc => ({
			...doc,
			metadata: doc.metadata as DocumentMetadata
		}));
	}

	async createFolder(data: { name: string; knowledgeBaseId: string; parentId?: string }): Promise<Folder> {
		const folder = await this.prisma.folder.create({
			data: {
				id: nanoid(),
				...data,
				metadata: Prisma.JsonNull,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		});
		
		return {
			...folder,
			metadata: folder.metadata as Record<string, any> | null
		};
	}

	async addDocument(
		file: File | undefined | null, 
		folderId: string,
		knowledgeBaseId: string
	): Promise<Document> {
		if (!file) {
			throw new Error('File is required');
		}

		const now = new Date();
		const id = nanoid();

		const processedDoc = await DocumentProcessor.processDocument(file);
		const chunks = DocumentProcessor.chunkText(processedDoc.content);

		const newDocument = await this.prisma.document.create({
			data: {
				id,
				title: file.name,
				type: file.type,
				content: processedDoc.content,
				metadata: processedDoc.metadata as Prisma.InputJsonValue,
				embeddings: processedDoc.embeddings,
				folderId,
				knowledgeBaseId,
				createdAt: now,
				updatedAt: now
			}
		});

		await lanceDbClient.addDocumentEmbeddings(
			`kb_${knowledgeBaseId}_vectors`,
			await embeddingService.embedChunks(chunks),
			chunks.map((chunk, index) => ({
				documentId: id,
				content: chunk,
				chunkIndex: index
			}))
		);

		return {
			...newDocument,
			metadata: newDocument.metadata as DocumentMetadata
		};
	}

	async updateDocument(
		documentId: string,
		file: File | undefined | null
	): Promise<Document> {
		if (!file) {
			throw new Error('File is required');
		}

		const existingDoc = await this.prisma.document.findUnique({
			where: { id: documentId }
		});

		if (!existingDoc) {
			throw new Error('Document not found');
		}

		const processedDoc = await DocumentProcessor.updateDocument(
			file, 
			existingDoc.metadata as DocumentMetadata
		);
		
		const chunks = DocumentProcessor.chunkText(processedDoc.content);

		// Delete old vectors and add new ones
		await lanceDbClient.addDocumentEmbeddings(
			`kb_${existingDoc.knowledgeBaseId}_vectors`,
			await embeddingService.embedChunks(chunks),
			chunks.map((chunk, index) => ({
				documentId,
				content: chunk,
				chunkIndex: index
			}))
		);

		const updatedDoc = await this.prisma.document.update({
			where: { id: documentId },
			data: {
				content: processedDoc.content,
				metadata: processedDoc.metadata as Prisma.InputJsonValue,
				embeddings: processedDoc.embeddings,
				updatedAt: new Date()
			}
		});

		return {
			...updatedDoc,
			metadata: updatedDoc.metadata as DocumentMetadata
		};
	}

	async searchDocuments(query: string, knowledgeBaseId: string, limit: number = 5): Promise<SearchResult[]> {
		const queryEmbedding = await embeddingService.embedText(query);
		
		const results = await lanceDbClient.similaritySearch(
			`kb_${knowledgeBaseId}_vectors`,
			queryEmbedding,
			limit
		);

		const documents = await this.prisma.document.findMany({
			where: {
				id: {
					in: results.map(r => r.documentId)
				}
			}
		});

		return results.map(result => ({
			document: {
				...documents.find(d => d.id === result.documentId)!,
				metadata: documents.find(d => d.id === result.documentId)!.metadata as DocumentMetadata
			},
			score: result.score
		}));
	}
}

export const knowledgeBaseService = new KnowledgeBaseService();

