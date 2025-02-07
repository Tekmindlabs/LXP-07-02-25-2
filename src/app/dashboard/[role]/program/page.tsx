'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, PlusCircle } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { ProgramList } from "@/components/dashboard/roles/super-admin/program/ProgramList";
import { ProgramForm } from "@/components/dashboard/roles/super-admin/program/ProgramForm";

export default function ProgramPage() {
	const [isCreating, setIsCreating] = useState(false);
	const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		calendarId: "",
	});

	const { toast } = useToast();
	
	const { 
		data: calendars,
		isLoading: calendarsLoading,
		error: calendarsError
	} = api.academicCalendar.getAllCalendars.useQuery(undefined, {
		retry: 1,
		refetchOnWindowFocus: false
	});
	
	const { 
		data: programData,
		refetch: refetchPrograms,
		isLoading: programsLoading,
		error: programsError
	} = api.program.getAll.useQuery({
		page: 1,
		pageSize: 10
	}, {
		retry: 1,
		refetchOnWindowFocus: false
	});
	
	const { 
		data: coordinators,
		isLoading: coordinatorsLoading,
		error: coordinatorsError
	} = api.program.getAvailableCoordinators.useQuery(undefined, {
		retry: 1,
		refetchOnWindowFocus: false
	});

	const createProgram = api.program.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Program created successfully",
			});
			setIsCreating(false);
			setFormData({ name: "", description: "", calendarId: "" });
			void refetchPrograms();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.calendarId) {
			toast({
				title: "Error",
				description: "Please select an academic year",
				variant: "destructive",
			});
			return;
		}
		createProgram.mutate(formData);
	};

	if (calendarsError || programsError || coordinatorsError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{calendarsError?.message || programsError?.message || coordinatorsError?.message}
				</AlertDescription>
			</Alert>
		);
	}

	const isLoading = calendarsLoading || programsLoading || coordinatorsLoading;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Program Management</h2>
				<Dialog open={isCreating} onOpenChange={setIsCreating}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							Create Program
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Program</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="name">Program Name</Label>
								<Input 
									id="name" 
									placeholder="Enter program name"
									value={formData.name}
									onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input 
									id="description" 
									placeholder="Enter program description"
									value={formData.description}
									onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="academicYear">Academic Year</Label>
								<Select 
									value={formData.calendarId}
									onValueChange={(value) => setFormData(prev => ({ ...prev, calendarId: value }))}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Academic Year" />
									</SelectTrigger>
									<SelectContent>
										{calendars?.map((calendar) => (
											<SelectItem key={calendar.id} value={calendar.id}>
												{calendar.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button type="submit" className="w-full" disabled={createProgram.isPending}>
								{createProgram.isPending ? "Creating..." : "Create Program"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Programs Overview</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : (
						<>
							<ProgramList 
								programs={programData?.programs || []}
								onSelect={setSelectedProgramId}
								calendars={calendars || []}
							/>
							{selectedProgramId && (
								<ProgramForm
									coordinators={coordinators || []}
									selectedProgram={programData?.programs?.find(p => p.id === selectedProgramId)}
									onSuccess={() => setSelectedProgramId(null)}
								/>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

