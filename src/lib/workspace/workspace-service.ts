import { prisma } from '@/server/db';
import { Workspace } from './types';
import { nanoid } from 'nanoid';
import { knowledgeBaseService } from '../knowledge-base/knowledge-base-service';

export class WorkspaceService {
	private readonly prisma;

	constructor() {
		this.prisma = prisma;
	}

	async createWorkspace(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
		// Create a knowledge base first
		const knowledgeBase = await knowledgeBaseService.createKnowledgeBase({
			name: `${data.name} Knowledge Base`,
			description: `Knowledge Base for workspace: ${data.name}`
		});

		return await this.prisma.workspace.create({
			data: {
				id: nanoid(),
				...data,
				knowledgeBaseId: knowledgeBase.id,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		});
	}

	async getWorkspace(id: string): Promise<Workspace> {
		return await this.prisma.workspace.findUnique({
			where: { id }
		});
	}

	async updateWorkspaceSettings(
		workspaceId: string, 
		settings: Workspace['settings']
	): Promise<Workspace> {
		return await this.prisma.workspace.update({
			where: { id: workspaceId },
			data: {
				settings,
				updatedAt: new Date()
			}
		});
	}

	async deleteWorkspace(workspaceId: string): Promise<void> {
		const workspace = await this.getWorkspace(workspaceId);
		if (!workspace) return;

		// Delete associated knowledge base
		await knowledgeBaseService.deleteKnowledgeBase(workspace.knowledgeBaseId);
		
		// Delete workspace and all related data
		await this.prisma.workspace.delete({
			where: { id: workspaceId }
		});
	}
}

export const workspaceService = new WorkspaceService();
