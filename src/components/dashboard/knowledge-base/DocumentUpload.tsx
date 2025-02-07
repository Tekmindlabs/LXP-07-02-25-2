'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { DocumentProcessor } from '@/lib/knowledge-base/document-processor';
import { useToast } from '@/hooks/use-toast';
import { ProcessedDocument } from '@/lib/knowledge-base/types';

export type FileWithContent = {
	name: string;
	type: string;
	size: number;
	lastModified: number;
	content: string;
};

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

interface DocumentUploadProps {
	onUpload: (processedDoc: ProcessedDocument & { file: FileWithContent }) => Promise<void>;
	folderId: string;
}

export function DocumentUpload({ onUpload, folderId }: DocumentUploadProps) {
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = React.useState(false);
	const { toast } = useToast();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !folderId) return;

		try {
			setIsUploading(true);
			const formData = new FormData();
			formData.append('file', file);
			
			const response = await fetch(`${BASE_URL}/api/process-document`, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to process document');
			}

			const processedDoc = await response.json();
			const content = await file.text(); // Read file content

			await onUpload({
				...processedDoc,
				file: {
					name: file.name,
					type: file.type,
					size: file.size,
					lastModified: file.lastModified,
					content
				}
			});
			
			toast({
				title: "Success",
				description: "Document uploaded and processed successfully",
			});
		} catch (error) {
			console.error('Upload failed:', error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to upload document",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	return (
		<div className="flex items-center gap-2">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				className="hidden"
				accept=".txt,.md,.pdf,.doc,.docx"
			/>
			<Button
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading || !folderId}
				variant="secondary"
			>
				<Upload className="mr-2 h-4 w-4" />
				{isUploading ? 'Processing...' : 'Upload Document'}
			</Button>
		</div>
	);
}

