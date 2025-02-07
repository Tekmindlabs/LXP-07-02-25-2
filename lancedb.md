## LanceDB Implementation Guide

### 1. Storage Setup

First, create the necessary storage directory structure:

```bash
mkdir -p storage/lancedb
mkdir -p storage/vector-cache
mkdir -p storage/documents
```

##n



# LanceDB Storage Configuration
STORAGE_DIR=./storage
VECTOR_CACHE_DIR=./storage/vector-cache
DOCUMENTS_DIR=./storage/documents
```

### 3. LanceDB Client Implementation

Create a new file `utils/vectorDb/lance/index.ts`:

```typescript
import { connect } from '@lancedb/lancedb';
import { TextSplitter } from '../TextSplitter';

export class LanceDbClient {
  private uri: string;
  
  constructor() {
    this.uri = `${process.env.STORAGE_DIR ? `${process.env.STORAGE_DIR}/` : "./storage/"}lancedb`;
  }

  async connect() {
    try {
      return await lancedb.connect(this.uri);
    } catch (error) {
      console.error('Failed to connect to LanceDB:', error);
      throw error;
    }
  }

  async createOrGetCollection(name: string, schema?: any) {
    const db = await this.connect();
    try {
      const existingTable = await db.openTable(name);
      return existingTable;
    } catch {
      // Table doesn't exist, create new
      return await db.createTable(name, [], schema);
    }
  }

  async addDocumentEmbeddings(
    collectionName: string,
    embeddings: number[][],
    metadata: any[]
  ) {
    const collection = await this.createOrGetCollection(collectionName);
    const data = embeddings.map((embedding, index) => ({
      vector: embedding,
      ...metadata[index]
    }));
    
    await collection.add(data);
  }

  async similaritySearch(
    collectionName: string,
    queryEmbedding: number[],
    limit: number = 5
  ) {
    const collection = await this.createOrGetCollection(collectionName);
    return await collection.search(queryEmbedding)
      .limit(limit)
      .execute();
  }

  async deleteCollection(name: string) {
    const db = await this.connect();
    try {
      await db.dropTable(name);
    } catch (error) {
      console.error(`Failed to delete collection ${name}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const lanceDbClient = new LanceDbClient();
```

### 4. Usage Example

```typescript
import { lanceDbClient } from '../utils/vectorDb/lance';
import { JinaEmbeddingService } from '../services/embedding';

async function processAndStoreDocument(
  workspaceId: string,
  document: Document,
  jinaEmbedder: JinaEmbeddingService
) {
  // 1. Split document into chunks
  const textSplitter = new TextSplitter();
  const chunks = textSplitter.split(document.content);

  // 2. Generate embeddings
  const embeddings = await jinaEmbedder.embedChunks(chunks);

  // 3. Prepare metadata
  const metadata = chunks.map((chunk, index) => ({
    documentId: document.id,
    workspaceId,
    content: chunk,
    chunkIndex: index,
  }));

  // 4. Store in LanceDB
  const collectionName = `workspace_${workspaceId}`;
  await lanceDbClient.addDocumentEmbeddings(
    collectionName,
    embeddings,
    metadata
  );
}

// Example search function
async function searchWorkspace(
  workspaceId: string,
  query: string,
  jinaEmbedder: JinaEmbeddingService
) {
  // 1. Generate query embedding
  const queryEmbedding = await jinaEmbedder.embedText(query);

  // 2. Search in workspace collection
  const results = await lanceDbClient.similaritySearch(
    `workspace_${workspaceId}`,
    queryEmbedding,
    5
  );

  return results;
}
```

### 5. Directory Structure

```
project_root/
├── storage/
│   ├── lancedb/        # LanceDB storage
│   ├── vector-cache/   # Cache for vectors
│   └── documents/      # Original documents
├── utils/
│   └── vectorDb/
│       └── lance/
│           └── index.ts
└── .env
```