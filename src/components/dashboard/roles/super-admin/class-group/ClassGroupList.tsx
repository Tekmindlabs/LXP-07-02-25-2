'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/utils/api";
import { ClassGroup, Status } from "@prisma/client";
import { Edit2, Trash2, Users, BookOpen, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassGroupListProps {
	classGroups: (ClassGroup & {
		program: {
			name: string | null;
		};
		classes: any[];
		subjects: any[];
	})[];
	onEdit: (id: string) => void;
	onView: (id: string) => void;
}

export const ClassGroupList = ({ classGroups, onEdit, onView }: ClassGroupListProps) => {
	const { toast } = useToast();
	const utils = api.useContext();
	const deleteMutation = api.classGroup.deleteClassGroup.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Class group deleted successfully",
			});
			utils.classGroup.getAllClassGroups.invalidate();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{classGroups.map((group) => (
				<Card key={group.id} className="overflow-hidden">
					<CardContent className="p-0">
						<div className="flex flex-col">
							<div className="border-b p-4">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold">{group.name}</h3>
									<span className={`rounded-full px-2 py-1 text-xs font-medium ${
										group.status === Status.ACTIVE 
											? 'bg-green-100 text-green-700' 
											: 'bg-yellow-100 text-yellow-700'
									}`}>
										{group.status}
									</span>
								</div>
								<p className="mt-1 text-sm text-muted-foreground">
									{group.program.name || 'Unnamed Program'}
								</p>
								{group.description && (
									<p className="mt-2 text-sm text-muted-foreground line-clamp-2">
										{group.description}
									</p>
								)}
							</div>
							<div className="grid grid-cols-2 gap-4 p-4 text-sm">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-muted-foreground" />
									<span>Classes: {group.classes.length}</span>
								</div>
								<div className="flex items-center gap-2">
									<BookOpen className="h-4 w-4 text-muted-foreground" />
									<span>Subjects: {group.subjects.length}</span>
								</div>
							</div>
							<div className="border-t p-4">
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onView(group.id)}
										className="flex items-center gap-2"
									>
										<Eye className="h-4 w-4" />
										View
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(group.id)}
										className="flex items-center gap-2"
									>
										<Edit2 className="h-4 w-4" />
										Edit
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => {
											if (confirm('Are you sure you want to delete this class group?')) {
												deleteMutation.mutate(group.id);
											}
										}}
										className="flex items-center gap-2"
									>
										<Trash2 className="h-4 w-4" />
										Delete
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};