'use client';

import { useState, useCallback } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface FileInfo {
	size: number;
	createdAt: Date;
	updatedAt: Date;
	mimeType: string;
	publicUrl: string;
}

interface FileUploadProps {
	onUploadComplete?: (filePath: string, fileInfo: FileInfo) => void;
	maxSize?: number;
	allowedTypes?: string[];
	className?: string;
	subDir?: string;
}

export const FileUpload = ({ 
	onUploadComplete, 
	maxSize = 10 * 1024 * 1024, // 10MB
	allowedTypes = ['image/*', 'application/pdf'],
	className,
	subDir
}: FileUploadProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [progress, setProgress] = useState(0);
	const { toast } = useToast();

	const uploadConfigMutation = api.upload.getUploadConfig.useMutation();

	// Subscribe to upload status changes
	api.upload.onUploadStatusChange.useSubscription(undefined, {
		onData(data) {
			if (data.status === 'completed' && data.filePath) {
				setProgress(100);
				onUploadComplete?.(data.filePath);
				toast({
					title: 'Upload complete',
					description: 'File has been successfully uploaded',
				});
			}
		},
	});


	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		// Validate file size
		if (selectedFile.size > maxSize) {
			toast({
				title: 'File too large',
				description: `File size should be less than ${maxSize / 1024 / 1024}MB`,
				variant: 'destructive',
			});
			return;
		}

		// Validate file type
		const isValidType = allowedTypes.some(type => {
			if (type.includes('*')) {
				const [category] = type.split('/');
				return selectedFile.type.startsWith(category);
			}
			return selectedFile.type === type;
		});

		if (!isValidType) {
			toast({
				title: 'Invalid file type',
				description: `Allowed file types: ${allowedTypes.join(', ')}`,
				variant: 'destructive',
			});
			return;
		}

		setFile(selectedFile);
	};

	const uploadFile = useCallback(async () => {
		if (!file) return;

		try {
			setProgress(10);
			const { uploadToken } = await uploadConfigMutation.mutateAsync({
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
			});

			setProgress(30);
			const formData = new FormData();
			formData.append('file', file);
			formData.append('uploadToken', uploadToken);
			if (subDir) {
				formData.append('subDir', subDir);
			}

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Upload failed');
			}

			setProgress(90);
			const { filePath, fileInfo } = await response.json();
			onUploadComplete?.(filePath, fileInfo);
			setProgress(100);

			toast({
				title: 'Upload complete',
				description: 'File has been successfully uploaded',
			});
		} catch (error) {
			toast({
				title: 'Upload failed',
				description: error instanceof Error ? error.message : 'An error occurred',
				variant: 'destructive',
			});
			setProgress(0);
		}
	}, [file, uploadConfigMutation, onUploadComplete, subDir, toast]);


	return (
		<div className={`space-y-4 ${className}`}>
			<input
				type="file"
				onChange={handleFileChange}
				className="hidden"
				id="file-upload"
				accept={allowedTypes?.join(',')}
			/>
			<label
				htmlFor="file-upload"
				className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
			>
				Choose File
			</label>
			
			{file && (
				<div className="space-y-2">
					<p className="text-sm">{file.name}</p>
					{progress > 0 && <Progress value={progress} className="w-full" />}
					<Button onClick={uploadFile} disabled={progress > 0 && progress < 100}>
						{progress > 0 ? 'Uploading...' : 'Upload'}
					</Button>
				</div>
			)}
		</div>
	);
};