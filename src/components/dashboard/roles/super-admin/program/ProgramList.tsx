"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { ProgramView } from "./ProgramView";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProgramListProps {
	programs: Array<{
		id: string;
		name: string;
		description?: string | null;
		status: string;
		calendar?: { name: string } | null;
		coordinator?: { user: { name: string } } | null;
		classGroups?: any[];
	}>;
	onSelect: (id: string) => void;
	calendars: Array<{ id: string; name: string }>;
}

export const ProgramList = ({
	programs,
	onSelect,
	calendars
}: ProgramListProps) => {
	const [viewingProgramId, setViewingProgramId] = useState<string | null>(null);
	const [programToDelete, setProgramToDelete] = useState<string | null>(null);
	const { toast } = useToast();
	const utils = api.useContext();

	const deleteMutation = api.program.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Program deleted successfully"
			});
			utils.program.getAll.invalidate();
			utils.program.searchPrograms.invalidate();
			setProgramToDelete(null);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive"
			});
			setProgramToDelete(null);
		},
	});

	if (viewingProgramId) {
		return <ProgramView programId={viewingProgramId} onBack={() => setViewingProgramId(null)} />;
	}

	const handleDelete = (programId: string) => {
		setProgramToDelete(programId);
	};

	const confirmDelete = () => {
		if (programToDelete) {
			deleteMutation.mutate(programToDelete);
		}
	};

	return (
		<div className="space-y-4">
			{programs.map((program) => (
				<Card key={program.id}>
					<CardHeader>
						<div className="flex justify-between items-center">
							<CardTitle>{program.name}</CardTitle>
							<div className="flex space-x-2">
								<Button 
									variant="secondary" 
									size="sm" 
									onClick={() => setViewingProgramId(program.id)}
								>
									View
								</Button>
								<Button 
									variant="outline" 
									size="sm" 
									onClick={() => onSelect(program.id)}
								>
									Edit
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => handleDelete(program.id)}
									disabled={deleteMutation.isPending}
								>
									{deleteMutation.isPending ? "Deleting..." : "Delete"}
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p>{program.description}</p>
							<p>Calendar: {program.calendar?.name || 'Not assigned'}</p>
							<p>Coordinator: {program.coordinator?.user.name || 'Not assigned'}</p>
							<p>Status: {program.status}</p>
							<p>Class Groups: {program.classGroups?.length || 0}</p>
						</div>
					</CardContent>
				</Card>
			))}

			<Dialog open={!!programToDelete} onOpenChange={() => setProgramToDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Program</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this program? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setProgramToDelete(null)}>
							Cancel
						</Button>
						<Button 
							variant="destructive" 
							onClick={confirmDelete}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
