export interface VersionInfo {
	timestamp: string;
	size: number;
}

export interface DocumentMetadata {
	size: number;
	lastModified: string;
	fileType: string;
	embeddingDimension: number;
	processedAt: string;
	previousVersions: VersionInfo[];
	chunks?: number;
	isImage?: boolean;
	[key: string]: any; // Allow additional metadata fields
}

export interface Document {
	id: string;
	title: string;
	type: string;
	content: string; // Base64 string for images, text content for documents
	metadata: DocumentMetadata;
	embeddings: number[];
	folderId: string;
	knowledgeBaseId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Folder {
	id: string;
	name: string;
	description: string | null;
	parentId: string | null;
	knowledgeBaseId: string;
	metadata: Record<string, any> | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface KnowledgeBase {
	id: string;
	name: string;
	description: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface SearchResult {
	document: Document;
	score: number;
}

export interface ProcessedDocument {
	content: string; // Base64 string for images, text content for documents
	embeddings: number[];
	metadata: DocumentMetadata;
}

// Prisma JSON value types
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
