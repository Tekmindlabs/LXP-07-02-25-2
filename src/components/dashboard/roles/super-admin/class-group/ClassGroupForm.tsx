'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/utils/api";
import { Status, CalendarType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface Program {
	id: string;
	name: string;
}

interface Calendar {
	id: string;
	name: string;
	description: string | null;
	type: CalendarType;
	status: Status;
}

interface FormData {
	name: string;
	description?: string;
	programId: string;
	status: Status;
	calendar: {
		id: string;
		inheritSettings: boolean;
	};
}

interface Props {
	programs: Program[];
	selectedClassGroup?: {
		id: string;
		name: string;
		description: string | null;
		programId: string;
		status: Status;
		calendarId?: string;
	};
	onSuccess?: () => void;
}

export const ClassGroupForm = ({ programs, selectedClassGroup, onSuccess }: Props) => {
	const [formData, setFormData] = useState<FormData>({
		name: selectedClassGroup?.name || "",
		description: selectedClassGroup?.description || undefined,
		programId: selectedClassGroup?.programId || "",
		status: selectedClassGroup?.status || Status.ACTIVE,
		calendar: {
			id: selectedClassGroup?.calendarId || "",
			inheritSettings: false
		}
	});

	const { data: calendars } = api.calendar.getAll.useQuery();




	const utils = api.useContext();
	const { toast } = useToast();

	const createMutation = api.classGroup.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Class group created successfully",
			});
			utils.classGroup.getAllClassGroups.invalidate();
			onSuccess?.();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateMutation = api.classGroup.update.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Class group updated successfully",
			});
			utils.classGroup.getAllClassGroups.invalidate();
			onSuccess?.();
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
		if (selectedClassGroup) {
			updateMutation.mutate({
				id: selectedClassGroup.id,
				name: formData.name,
				description: formData.description,
				programId: formData.programId,
				status: formData.status,
				calendar: {
					id: formData.calendar.id,
					inheritSettings: formData.calendar.inheritSettings
				}
			});
		} else {
			createMutation.mutate({
				name: formData.name,
				description: formData.description,
				programId: formData.programId,
				status: formData.status,
				calendar: {
					id: formData.calendar.id,
					inheritSettings: formData.calendar.inheritSettings
				}
			});
		}
	};



	return (
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
				<Label htmlFor="program">Program</Label>
				<Select
					value={formData.programId}
					onValueChange={(value) => setFormData({ ...formData, programId: value })}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a program" />
					</SelectTrigger>
					<SelectContent>
						{programs.map((program: Program) => (
							<SelectItem key={program.id} value={program.id}>
								{program.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor="calendar">Calendar</Label>
				<Select
					value={formData.calendar.id}
					onValueChange={(value) => setFormData({
						...formData,
						calendar: { ...formData.calendar, id: value }
					})}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a calendar" />
					</SelectTrigger>
					<SelectContent>
						{calendars?.map((calendar: Calendar) => (
							<SelectItem key={calendar.id} value={calendar.id}>
								{calendar.name || 'Unnamed Calendar'}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
				{selectedClassGroup ? "Update" : "Create"} Class Group
			</Button>
		</form>
	);
};
