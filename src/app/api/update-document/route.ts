import { NextResponse } from 'next/server';
import JinaService from '@/lib/knowledge-base/jina.server';
import type { DocumentMetadata } from '@/lib/knowledge-base/jina.server';

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File;
		const previousMetadataStr = formData.get('previousMetadata') as string;
		
		if (!file || !previousMetadataStr) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const previousMetadata = JSON.parse(previousMetadataStr) as DocumentMetadata;
		const result = await JinaService.updateDocument(file, previousMetadata);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Failed to update document:', error);
		return NextResponse.json(
			{ error: 'Failed to update document' },
			{ status: 500 }
		);
	}
}