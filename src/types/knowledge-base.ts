export interface KnowledgeBase {
	id: string;
	name: string;
	description: string;
	folders: DocumentFolder[];
	documents: Document[];
	createdAt: Date;
	updatedAt: Date;
}

export interface DocumentFolder {
	id: string;
	name: string;
	description: string;
	parentFolderId?: string;
	documents: Document[];
	metadata: Record<string, any>;
}

export interface Document {
	id: string;
	title: string;
	type: string;
	content: string;
	metadata: Record<string, any>;
	embeddings: number[];
	folderId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkspaceDocument {
	id: string;
	sourceDocumentId: string;
	workspaceId: string;
	metadata: Record<string, any>;
	permissions: DocumentPermission[];
}

export interface DocumentPermission {
	id: string;
	documentId: string;
	roleId: string;
	permissions: string[];
}