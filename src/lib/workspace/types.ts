import { z } from "zod";

export const WorkspaceSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	knowledgeBaseId: z.string(),
	settings: z.object({
		messageLimit: z.number().min(1).max(1000),
		aiProvider: z.enum(['openai', 'anthropic', 'google']),
		aiModel: z.string().min(1),
		maxTokens: z.number().min(100).max(4000),
		temperature: z.number().min(0).max(2),
	}),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
