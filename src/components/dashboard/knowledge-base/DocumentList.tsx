'use client';

import React, { useState } from 'react';
import { Document } from '@/lib/knowledge-base/types';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DocumentListProps {
	documents: Document[];
	onDocumentSelect: (document: Document) => void;
}

export function DocumentList({ documents, onDocumentSelect }: DocumentListProps) {
	const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	return (
		<ScrollArea className="h-[calc(100vh-12rem)]">
			<div className="grid gap-4 p-4">
				{documents.map((doc) => (
					<Card key={doc.id} className="hover:bg-accent/50">
						<CardContent className="p-4">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2" onClick={() => onDocumentSelect(doc)}>
									<FileText className="h-4 w-4" />
									<div>
										<h4 className="font-medium">{doc.title}</h4>
										<p className="text-sm text-muted-foreground">
											{new Date(doc.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								
								<Dialog open={isPreviewOpen && selectedDoc?.id === doc.id} 
									   onOpenChange={(open) => {
										   setIsPreviewOpen(open);
										   if (open) setSelectedDoc(doc);
									   }}>
									<DialogTrigger asChild>
										<Button variant="ghost" size="icon">
											<Eye className="h-4 w-4" />
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-4xl">
										<DialogHeader>
											<DialogTitle>{doc.title}</DialogTitle>
										</DialogHeader>
										<div className="max-h-[60vh] overflow-y-auto">
											<pre className="whitespace-pre-wrap font-mono text-sm">
												{doc.content}
											</pre>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}

