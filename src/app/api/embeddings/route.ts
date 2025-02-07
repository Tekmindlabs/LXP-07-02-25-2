import { NextResponse } from 'next/server';
import JinaService from '@/lib/knowledge-base/jina.server';

export async function POST(req: Request) {
	try {
		const { input } = await req.json();
		const embeddings = await JinaService.generateEmbeddings(input);
		return NextResponse.json({ embeddings });
	} catch (error) {
		console.error('Failed to generate embeddings:', error);
		return NextResponse.json(
			{ error: 'Failed to generate embeddings' },
			{ status: 500 }
		);
	}
}