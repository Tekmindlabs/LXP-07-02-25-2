import { NextResponse } from 'next/server';
import { DocumentProcessor } from '@/lib/knowledge-base/document-processor';

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File;
		
		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 }
			);
		}

		const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		if (!validTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: `Unsupported file type: ${file.type}. Supported types: ${validTypes.join(', ')}` },
				{ status: 400 }
			);
		}

		const MAX_SIZE = 10 * 1024 * 1024;
		if (file.size > MAX_SIZE) {
			return NextResponse.json(
				{ error: 'File size exceeds limit (10MB)' },
				{ status: 400 }
			);
		}

		try {
			const processedDoc = await DocumentProcessor.processDocument(file);
			return NextResponse.json(processedDoc);
		} catch (error) {
			console.error('Document processing error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
			
			return NextResponse.json(
				{ 
					error: errorMessage,
					type: file.type,
					size: file.size
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Route handler error:', error);
		return NextResponse.json(
			{ error: 'Failed to process document request' },
			{ status: 500 }
		);
	}
}
