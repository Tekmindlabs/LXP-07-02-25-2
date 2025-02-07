import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { WorkspaceSchema } from "../../../lib/workspace/types";
import { workspaceService } from "../../../lib/workspace/workspace-service";
import { WorkspaceChatService } from '../../../lib/workspace/workspace-chat-service';
import { createWorkspaceTools } from '../../../lib/ai/workspace-tools';
import { ModelProvider } from '../../../lib/ai/model-providers';
import { prisma } from "../../db";

export const workspaceRouter = createTRPCRouter({
	getWorkspace: protectedProcedure
		.input(z.object({
			workspaceId: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			const workspace = await ctx.prisma.workspaceDocument.findMany({
				where: { workspaceId: input.workspaceId },
				include: {
					sourceDocument: true,
				},
			});

			const settings = await ctx.prisma.workspaceSettings.findUnique({
				where: { workspaceId: input.workspaceId },
			});

			const chat = await ctx.prisma.workspaceChat.findFirst({
				where: {
					workspaceId: input.workspaceId,
					userId: ctx.session.user.id,
				},
			});

			return {
				id: input.workspaceId,
				documents: workspace,
				settings: settings || {
					id: '',
					workspaceId: input.workspaceId,
					messageLimit: 100,
					aiProvider: 'openai',
					aiModel: 'gpt-3.5-turbo',
					maxTokens: 2000,
					temperature: 0.7,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				chat,
			};
		}),

	createWorkspace: protectedProcedure
		.input(WorkspaceSchema.omit({ id: true }))
		.mutation(async ({ input }) => {
			return await workspaceService.createWorkspace(input);
		}),

	updateWorkspaceSettings: protectedProcedure
		.input(z.object({
			workspaceId: z.string(),
			settings: z.object({
				messageLimit: z.number().min(1).max(1000),
				aiProvider: z.enum(['openai', 'anthropic', 'google']),
				aiModel: z.string().min(1),
				maxTokens: z.number().min(100).max(4000),
				temperature: z.number().min(0).max(2),
			}),
		}))
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.workspaceSettings.upsert({
				where: { workspaceId: input.workspaceId },
				create: {
					workspaceId: input.workspaceId,
					...input.settings,
				},
				update: input.settings,
			});
		}),

	deleteWorkspace: protectedProcedure
		.input(z.object({ workspaceId: z.string() }))
		.mutation(async ({ input }) => {
			await workspaceService.deleteWorkspace(input.workspaceId);
		})
});