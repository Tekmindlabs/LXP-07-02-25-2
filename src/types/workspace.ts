import { Workspace, WorkspaceDocument } from "./knowledge-base";

export interface WorkspaceSettings {
	id: string;
	workspaceId: string;
	messageLimit: number;
	aiProvider: 'openai' | 'anthropic' | 'google';
	aiModel: string;
	maxTokens: number;
	temperature: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkspaceChat {
	id: string;
	workspaceId: string;
	userId: string;
	messageCount: number;
	lastMessageAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkspaceChatMessage {
	id: string;
	chatId: string;
	content: string;
	role: 'user' | 'assistant' | 'system';
	tokens: number;
	createdAt: Date;
}

export interface WorkspaceWithSettings extends Workspace {
	settings: WorkspaceSettings;
	documents: WorkspaceDocument[];
	chat?: WorkspaceChat;
}