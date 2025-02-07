'use client';

import React, { useState } from 'react';
import { api } from '@/utils/api';
import { DocumentList } from './DocumentList';
import { FolderTree } from './FolderTree';
import { DocumentUpload, FileWithContent } from './DocumentUpload';
import { Document, Folder, ProcessedDocument } from '@/lib/knowledge-base/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function KnowledgeBaseView() {
	const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

	const [searchQuery, setSearchQuery] = useState('');
	const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');

	const utils = api.useContext();

	const { data: knowledgeBase } = api.knowledgeBase.getKnowledgeBase.useQuery();
	const { data: folders = [] } = api.knowledgeBase.getFolders.useQuery(
		{ knowledgeBaseId: knowledgeBase?.id ?? '' },
		{ enabled: !!knowledgeBase }
	);

	const { data: searchResults = [] } = api.knowledgeBase.searchDocuments.useQuery(
		{ query: searchQuery },
		{ enabled: searchQuery.length > 0 }
	);

	const { data: documents = [] } = api.knowledgeBase.getDocuments.useQuery(
		{ 
			folderId: selectedFolder?.id ?? '',
			knowledgeBaseId: knowledgeBase?.id ?? '' 
		},
		{ enabled: !searchQuery && !!selectedFolder }
	);

	const createFolderMutation = api.knowledgeBase.createFolder.useMutation({
		onSuccess: () => {
			void utils.knowledgeBase.getFolders.invalidate({ knowledgeBaseId: knowledgeBase?.id });
			setIsCreateFolderOpen(false);
			setNewFolderName('');
		}
	});

	const handleCreateFolder = async () => {
		if (!knowledgeBase || !newFolderName) return;
		await createFolderMutation.mutateAsync({
			name: newFolderName,
			knowledgeBaseId: knowledgeBase.id,
			parentId: selectedFolder?.id
		});
	};

	const uploadMutation = api.knowledgeBase.uploadDocument.useMutation({
		onSuccess: () => {
			if (selectedFolder) {
				void utils.knowledgeBase.getDocuments.invalidate({ 
					folderId: selectedFolder.id,
					knowledgeBaseId: knowledgeBase?.id 
				});
			}
		}
	});

	const handleUpload = async (processedDoc: ProcessedDocument & { file: FileWithContent }) => {
		if (!selectedFolder || !knowledgeBase) return;
		
		await uploadMutation.mutateAsync({
			file: processedDoc.file,
			knowledgeBaseId: knowledgeBase.id,
			folderId: selectedFolder.id
		});
	};

	const handleFolderSelect = (folder: Folder) => {
		setSelectedFolder(folder);
		setSearchQuery('');
	};


	const displayDocuments = searchQuery ? 
		searchResults.map(result => result.document) : 
		documents;

	return (
		<div className="flex h-full gap-4">
			{/* Left Column */}
			<div className="w-1/4 flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Folders</h3>
					<Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
						<DialogTrigger asChild>
							<Button variant="ghost" size="icon">
								<Plus className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Folder</DialogTitle>
							</DialogHeader>
							<div className="flex flex-col gap-4">
								<Input
									placeholder="Folder name"
									value={newFolderName}
									onChange={(e) => setNewFolderName(e.target.value)}
								/>
								<Button onClick={handleCreateFolder}>Create</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
				
				<FolderTree
					folders={folders}
					onFolderSelect={handleFolderSelect}
					selectedFolderId={selectedFolder?.id}
				/>
			</div>

			{/* Right Column */}
			<div className="flex-1 flex flex-col gap-4">
				<div className="flex items-center gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search documents..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
					</div>
					{selectedFolder && (
						<DocumentUpload
							onUpload={handleUpload}
							folderId={selectedFolder.id}
						/>
					)}
				</div>

				<DocumentList
					documents={displayDocuments}
					onDocumentSelect={(doc: Document) => {}}
				/>
			</div>
		</div>
	);
}
