import type { DocumentMetadata } from './types';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export class JinaClient {
    static async generateEmbeddings(input: string | { image: string }): Promise<number[]> {
        const response = await fetch(`${BASE_URL}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate embeddings');
        }

        const data = await response.json();
        return data.embeddings;
    }
}
