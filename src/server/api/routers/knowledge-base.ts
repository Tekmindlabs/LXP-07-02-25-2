import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { knowledgeBaseService } from "../../../lib/knowledge-base/knowledge-base-service";
import { DocumentProcessor } from "../../../lib/knowledge-base/document-processor";

const ProcessedDocumentSchema = z.object({
	content: z.string(),
	embeddings: z.array(z.number()),
	metadata: z.object({
		size: z.number(),
		lastModified: z.string(),
		fileType: z.string(),
		embeddingDimension: z.number(),
		processedAt: z.string(),
		previousVersions: z.array(z.object({
			timestamp: z.string(),
			size: z.number()
		})),
		chunks: z.number().optional()
	}).catchall(z.any())
});

export const knowledgeBaseRouter = createTRPCRouter({
	getKnowledgeBase: protectedProcedure
		.query(async () => {
			return await knowledgeBaseService.getKnowledgeBase();
		}),

	getFolders: protectedProcedure
		.input(z.object({
			knowledgeBaseId: z.string()
		}))
		.query(async ({ input }) => {
			return await knowledgeBaseService.getFolders(input.knowledgeBaseId);
		}),

	getDocuments: protectedProcedure
		.input(z.object({
			folderId: z.string(),
			knowledgeBaseId: z.string()
		}))
		.query(async ({ input }) => {
			return await knowledgeBaseService.getDocuments(
				input.folderId,
				input.knowledgeBaseId
			);
		}),

	createFolder: protectedProcedure
		.input(z.object({
			name: z.string(),
			knowledgeBaseId: z.string(),
			parentId: z.string().optional()
		}))
		.mutation(async ({ input }) => {
			return await knowledgeBaseService.createFolder(input);
		}),

		uploadDocument: protectedProcedure
		.input(z.object({
			file: z.object({
				name: z.string(),
				type: z.string(),
				size: z.number(),
				lastModified: z.number(),
				content: z.string()  // We'll pass the file content directly
			}),
			knowledgeBaseId: z.string(),
			folderId: z.string()
		}))
		.mutation(async ({ input }) => {
			// Create a File object from the input
			const file = new File(
				[input.file.content],
				input.file.name,
				{
					type: input.file.type,
					lastModified: input.file.lastModified
				}
			);
			
			return await knowledgeBaseService.addDocument(
				file,
				input.folderId,
				input.knowledgeBaseId
			);
		}),



	searchDocuments: protectedProcedure
		.input(z.object({
			query: z.string(),
			limit: z.number().optional()
		}))
		.query(async ({ input }) => {
			const kb = await knowledgeBaseService.getKnowledgeBase();
			return await knowledgeBaseService.searchDocuments(
				input.query,
				kb.id,
				input.limit
			);
		})
});

