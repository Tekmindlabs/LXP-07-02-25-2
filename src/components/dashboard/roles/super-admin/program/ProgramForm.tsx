"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { api } from "@/utils/api";
import { Status } from "@prisma/client";
import { toast } from "@/hooks/use-toast";
import type { TRPCClientErrorLike } from "@trpc/client";


interface ProgramFormData {
	name: string;
	description?: string;
	calendarId: string;
	coordinatorId?: string;
	status: Status;
}

interface ProgramFormProps {
	selectedProgram?: any;
	coordinators: any[];
	onSuccess: () => void;
}

export const ProgramForm = ({ selectedProgram, coordinators, onSuccess }: ProgramFormProps) => {
	const [formData, setFormData] = useState<ProgramFormData>(() => ({
		name: selectedProgram?.name || "",
		description: selectedProgram?.description || "",
		calendarId: selectedProgram?.calendarId || "NO_SELECTION",
		coordinatorId: selectedProgram?.coordinatorId || "NO_SELECTION",
		status: selectedProgram?.status || Status.ACTIVE,
	}));

	const { 
		data: calendars, 
		isLoading: calendarsLoading,
		error: calendarsError 
	} = api.academicCalendar.getAllCalendars.useQuery(undefined, {
		retry: 1,
		refetchOnWindowFocus: false
	});
	const utils = api.useContext();

	const createMutation = api.program.create.useMutation({
		onSuccess: () => {
			utils.program.getAll.invalidate();
			resetForm();
			onSuccess();
			toast({
				title: "Success",
				description: "Program created successfully",
			});
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateMutation = api.program.update.useMutation({
		onSuccess: () => {
			utils.program.getAll.invalidate();
			resetForm();
			onSuccess();
			toast({
				title: "Success",
				description: "Program updated successfully",
			});
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			calendarId: "NO_SELECTION",
			coordinatorId: "NO_SELECTION",
			status: Status.ACTIVE,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!formData.name.trim()) {
			toast({
				title: "Error",
				description: "Program name is required",
				variant: "destructive",
			});
			return;
		}

		if (formData.calendarId === "NO_SELECTION") {
			toast({
				title: "Error",
				description: "Calendar selection is required",
				variant: "destructive",
			});
			return;
		}

		const submissionData = {
			...formData,
			coordinatorId: formData.coordinatorId === "NO_SELECTION" ? undefined : formData.coordinatorId,
		};

		if (selectedProgram) {
			updateMutation.mutate({
				id: selectedProgram.id,
				...submissionData,
			});
		} else {
			createMutation.mutate(submissionData);
		}
	};

	if (calendarsError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					Error loading calendars: {calendarsError.message}
				</AlertDescription>
			</Alert>
		);
	}

	if (calendarsLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle>{selectedProgram ? "Edit" : "Create"} Program</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
						/>
					</div>

					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						/>
					</div>

					<div>
						<Label htmlFor="calendar">Calendar</Label>
						<Select
							value={formData.calendarId}
							onValueChange={(value) => setFormData({ ...formData, calendarId: value })}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Calendar" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="NO_SELECTION">Select Calendar</SelectItem>
								{calendars?.map((calendar) => (
									<SelectItem key={calendar.id} value={calendar.id}>
										{calendar.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="coordinator">Coordinator</Label>
						<Select
							value={formData.coordinatorId}
							onValueChange={(value) => setFormData({ ...formData, coordinatorId: value })}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Coordinator" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="NO_SELECTION">Select Coordinator</SelectItem>
								{coordinators.map((coordinator) => (
									<SelectItem key={coordinator.id} value={coordinator.id}>
										{coordinator.user.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="status">Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select Status" />
							</SelectTrigger>
							<SelectContent>
								{Object.values(Status).map((status) => (
									<SelectItem key={status} value={status}>
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button type="submit" className="w-full" disabled={createMutation.status === 'pending' || updateMutation.status === 'pending'}>
						{createMutation.status === 'pending' || updateMutation.status === 'pending' ? 'Saving...' : selectedProgram ? "Update" : "Create"} Program
					</Button>
				</form>
			</CardContent>
		</Card>
	);

};
