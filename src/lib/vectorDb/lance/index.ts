import path from 'path';
import fs from 'fs';

let lancedb: any = null;

// Only load on server side
if (typeof window === 'undefined') {
  try {
    // Import the native module
    lancedb = require('@lancedb/lancedb-win32-x64-msvc');
    
    // Ensure data directory exists
    const dataPath = path.join(process.cwd(), 'data', 'lancedb');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    
    console.log('LanceDB loaded successfully');
  } catch (error) {
    console.error('Failed to load LanceDB:', error);
  }
}

export class LanceDBClient {
  private db: any;
  private uri: string;

  constructor() {
    this.uri = path.join(process.cwd(), 'data', 'lancedb');
  }

  async connect() {
    if (!lancedb) {
      throw new Error('LanceDB module not loaded - only available server-side');
    }

    try {
      this.db = await lancedb.connect(this.uri);
      return this.db;
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
      return await db.createTable(name, [], schema);
    }
  }

  async addDocumentEmbeddings(collectionName: string, embeddings: number[][], metadata: any[]) {
    const collection = await this.createOrGetCollection(collectionName);
    const data = embeddings.map((embedding, index) => ({
      vector: embedding,
      ...metadata[index]
    }));
    await collection.add(data);
  }

  async similaritySearch(collectionName: string, queryEmbedding: number[], limit: number = 5) {
    const collection = await this.createOrGetCollection(collectionName);
    const searchQuery = collection.search(queryEmbedding).limit(limit);
    const results = await searchQuery.execute();
    
    const searchResults = [];
    for await (const batch of results) {
      for (const row of batch) {
        searchResults.push({
          score: row.score,
          content: row.content,
          documentId: row.documentId,
          metadata: row.metadata
        });
      }
    }
    return searchResults;
  }

  async deleteCollection(name: string): Promise<void> {
    const db = await this.connect();
    try {
      await db.dropTable(name);
    } catch (error) {
      console.error(`Failed to delete collection ${name}:`, error);
      throw error;
    }
  }
}

export const lanceDbClient = new LanceDBClient();
