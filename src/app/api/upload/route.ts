import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/server/auth';
import { localStorage } from '@/lib/storage/local-storage';

export async function POST(req: NextRequest) {
	try {
		const session = await getServerAuthSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const formData = await req.formData();
		const file = formData.get('file') as File;
		const uploadToken = formData.get('uploadToken') as string;
		const subDir = formData.get('subDir') as string | undefined;

		if (!file || !uploadToken) {
			return NextResponse.json({ error: 'Missing file or upload token' }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const filePath = await localStorage.saveFile(
			buffer,
			file.name,
			file.type,
			subDir ? `${session.user.id}/${subDir}` : session.user.id
		);

		const fileInfo = await localStorage.getFileInfo(filePath);

		return NextResponse.json({ filePath, fileInfo });
	} catch (error) {
		console.error('Upload error:', error);
		if (error instanceof Error && error.message.includes('File size exceeds')) {
			return NextResponse.json({ error: error.message }, { status: 413 });
		}
		if (error instanceof Error && error.message.includes('File type not allowed')) {
			return NextResponse.json({ error: error.message }, { status: 415 });
		}
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const session = await getServerAuthSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const filePath = searchParams.get('path');

		if (!filePath) {
			const userFiles = await localStorage.listFiles(session.user.id);
			return NextResponse.json({ files: userFiles });
		}

		const fileInfo = await localStorage.getFileInfo(filePath);
		return NextResponse.json(fileInfo);
	} catch (error) {
		console.error('File info error:', error);
		return NextResponse.json({ error: 'Failed to get file info' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerAuthSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { filePath } = await req.json();
		if (!filePath) {
			return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
		}

		// Ensure users can only delete their own files
		if (!filePath.includes(`/uploads/${session.user.id}/`)) {
			return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 });
		}

		await localStorage.deleteFile(filePath);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Delete error:', error);
		return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
	}
}