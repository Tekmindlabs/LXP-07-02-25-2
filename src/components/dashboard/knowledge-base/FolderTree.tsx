'use client';

import React from 'react';
import { Folder } from '@/lib/knowledge-base/types';
import { ChevronRight, ChevronDown, FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FolderTreeProps {
	folders: Folder[];
	selectedFolderId?: string;
	onFolderSelect: (folder: Folder) => void;
}

interface FolderNode extends Folder {
	children?: FolderNode[];
}

export function FolderTree({ folders, selectedFolderId, onFolderSelect }: FolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());

	const buildFolderTree = (folders: Folder[]): FolderNode[] => {
		const folderMap = new Map<string, FolderNode>();
		const rootFolders: FolderNode[] = [];

		// Create folder nodes
		folders.forEach(folder => {
			folderMap.set(folder.id, { ...folder });
		});

		// Build tree structure
		folders.forEach(folder => {
			const node = folderMap.get(folder.id)!;
			if (folder.parentId) {
				const parent = folderMap.get(folder.parentId);
				if (parent) {
					if (!parent.children) parent.children = [];
					parent.children.push(node);
				}
			} else {
				rootFolders.push(node);
			}
		});

		return rootFolders;
	};

	const toggleFolder = (folderId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedFolders(prev => {
			const next = new Set(prev);
			if (next.has(folderId)) {
				next.delete(folderId);
			} else {
				next.add(folderId);
			}
			return next;
		});
	};

	const renderFolder = (folder: FolderNode, depth = 0) => {
		const isExpanded = expandedFolders.has(folder.id);
		const hasChildren = folder.children && folder.children.length > 0;
		const isSelected = folder.id === selectedFolderId;

		return (
			<div key={folder.id}>
				<Button
					variant={isSelected ? "secondary" : "ghost"}
					className={cn(
						"w-full justify-start",
						`pl-${depth * 4}`,
						isSelected && "bg-accent"
					)}
					onClick={() => onFolderSelect(folder)}
				>
					<div className="flex items-center gap-2">
						{hasChildren && (
							<button
								onClick={(e) => toggleFolder(folder.id, e)}
								className="p-1"
							>
								{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
							</button>
						)}
						<FolderIcon size={16} />
						<span className="truncate">{folder.name}</span>
					</div>
				</Button>
				
				{isExpanded && hasChildren && (
					<div className="ml-4">
						{folder.children?.map(child => renderFolder(child, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	const folderTree = buildFolderTree(folders);

	return (
		<div className="space-y-1">
			{folderTree.map(folder => renderFolder(folder))}
		</div>
	);
}