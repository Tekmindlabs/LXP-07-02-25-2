import { Tool } from 'langchain/tools';
import { prisma } from '@/server/db';

export const createWorkspaceTools = (workspaceId: string): Tool[] => {
	return [
		new Tool({
			name: "list_documents",
			description: "List all documents in the workspace",
			func: async () => {
				const docs = await prisma.workspaceDocument.findMany({
					where: { workspaceId },
					include: { sourceDocument: true }
				});
				return JSON.stringify(docs.map(d => ({
					title: d.sourceDocument.title,
					type: d.sourceDocument.type
				})));
			}
		}),

		new Tool({
			name: "search_documents",
			description: "Search for documents by title or content",
			func: async (query: string) => {
				const docs = await prisma.workspaceDocument.findMany({
					where: {
						workspaceId,
						OR: [
							{ sourceDocument: { title: { contains: query } } },
							{ sourceDocument: { content: { contains: query } } }
						]
					},
					include: { sourceDocument: true }
				});
				return JSON.stringify(docs.map(d => ({
					title: d.sourceDocument.title,
					type: d.sourceDocument.type,
					preview: d.sourceDocument.content.substring(0, 200)
				})));
			}
		}),

		new Tool({
			name: "get_workspace_info",
			description: "Get information about the current workspace",
			func: async () => {
				const workspace = await prisma.workspace.findUnique({
					where: { id: workspaceId },
					include: {
						settings: true,
						_count: {
							select: { documents: true }
						}
					}
				});
				return JSON.stringify({
					name: workspace.name,
					description: workspace.description,
					documentCount: workspace._count.documents,
					settings: workspace.settings
				});
			}
		}),

		new Tool({
			name: "summarize_document",
			description: "Get a summary of a specific document by title",
			func: async (title: string) => {
				const doc = await prisma.workspaceDocument.findFirst({
					where: {
						workspaceId,
						sourceDocument: { title }
					},
					include: { sourceDocument: true }
				});
				
				if (!doc) return "Document not found";
				
				// Return first 500 characters as a summary
				return doc.sourceDocument.content.substring(0, 500) + "...";
			}
		})
	];
};