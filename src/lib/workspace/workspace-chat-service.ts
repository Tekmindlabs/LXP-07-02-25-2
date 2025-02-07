import { ReactAgent } from '../ai/react-agent';
import { getLanguageModel, ModelProvider } from '../ai/model-providers';
import { Tool } from 'langchain/tools';
import { prisma } from '@/server/db';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	createdAt: Date;
}

export class WorkspaceChatService {
	private agent: ReactAgent;
	private workspaceId: string;
	private userId: string;

	constructor(
		workspaceId: string,
		userId: string,
		provider: ModelProvider,
		tools: Tool[] = []
	) {
		this.workspaceId = workspaceId;
		this.userId = userId;
		
		// Get workspace's knowledge base ID
		this.initializeAgent(provider, tools);
	}

	private async initializeAgent(provider: ModelProvider, tools: Tool[]) {
		const workspace = await prisma.workspace.findUnique({
			where: { id: this.workspaceId }
		});

		if (!workspace) {
			throw new Error('Workspace not found');
		}

		const model = getLanguageModel(provider);
		this.agent = new ReactAgent(model, workspace.knowledgeBaseId, tools);
	}

	private async getChatHistory(): Promise<string> {
		const messages = await prisma.workspaceChat.findMany({
			where: {
				workspaceId: this.workspaceId,
				userId: this.userId
			},
			orderBy: { createdAt: 'asc' },
			take: 10 // Get last 10 messages for context
		});

		return messages.map(msg => 
			`${msg.role}: ${msg.content}`
		).join('\n');
	}

	async sendMessage(content: string): Promise<ChatMessage> {
		const chatHistory = await this.getChatHistory();
		
		// Save user message
		const userMessage = await prisma.workspaceChat.create({
			data: {
				workspaceId: this.workspaceId,
				userId: this.userId,
				role: 'user',
				content
			}
		});

		// Get agent response
		const response = await this.agent.chat(content, chatHistory);

		// Save assistant message
		const assistantMessage = await prisma.workspaceChat.create({
			data: {
				workspaceId: this.workspaceId,
				userId: this.userId,
				role: 'assistant',
				content: response.success ? response.response : 'I encountered an error processing your request.'
			}
		});

		return assistantMessage;
	}

	async clearChat(): Promise<void> {
		await prisma.workspaceChat.deleteMany({
			where: {
				workspaceId: this.workspaceId,
				userId: this.userId
			}
		});
	}
}