"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CalendarFormState = {
	name: string;
	description: string;
	type: CalendarType;
};
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Status, CalendarType } from "@prisma/client";
import { TermSettings } from "./TermSettings";

export const AcademicYearSettings = () => {
	const [settings, setSettings] = useState({
		startMonth: 1,
		startDay: 1,
		endMonth: 12,
		endDay: 31,
	});

	const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
	const [calendar, setCalendar] = useState<CalendarFormState>({
		name: "",
		description: "",
		type: CalendarType.PRIMARY,
	});

	const { toast } = useToast();
	const utils = api.useContext();

	const { data: academicYear } = api.academicYear.getAllAcademicYears.useQuery();

	const { data: calendars } = api.calendar.getAll.useQuery();
	const updateSettings = api.academicYear.updateSettings.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Academic year settings updated successfully",
			});
			utils.academicYear.getSettings.invalidate();
		},
	});

	const createCalendar = api.calendar.createCalendar.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Calendar created successfully",
			});
			setIsCalendarDialogOpen(false);
			utils.calendar.getAll.invalidate();
		},
	});

	const months = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: new Date(0, i).toLocaleString('default', { month: 'long' })
	}));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateSettings.mutate(settings);
	};

	const handleCalendarSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!academicYear?.[0]?.id) return;

		const currentYear = new Date().getFullYear();
		createCalendar.mutate({
			...calendar,
			academicYearId: academicYear[0].id,
			startDate: new Date(currentYear, settings.startMonth - 1, settings.startDay),
			endDate: new Date(currentYear + 1, settings.endMonth - 1, settings.endDay),
			status: Status.ACTIVE,
		});
	};

	return (
		<div className="space-y-6">
			<Card>
			<CardHeader>
				<CardTitle>Academic Year Configuration</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-2 gap-6">
						<div className="space-y-4">
							<h3 className="font-medium">Academic Year Start</h3>
							<div className="space-y-2">
								<Label>Month</Label>
								<Select
									value={settings.startMonth.toString()}
									onValueChange={(value) => 
										setSettings({ ...settings, startMonth: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{months.map((month) => (
											<SelectItem 
												key={month.value} 
												value={month.value.toString()}
											>
												{month.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Day</Label>
								<Input
									type="number"
									min={1}
									max={31}
									value={settings.startDay}
									onChange={(e) => 
										setSettings({ 
											...settings, 
											startDay: parseInt(e.target.value) 
										})
									}
								/>
							</div>
						</div>
						<div className="space-y-4">
							<h3 className="font-medium">Academic Year End</h3>
							<div className="space-y-2">
								<Label>Month</Label>
								<Select
									value={settings.endMonth.toString()}
									onValueChange={(value) => 
										setSettings({ ...settings, endMonth: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{months.map((month) => (
											<SelectItem 
												key={month.value} 
												value={month.value.toString()}
											>
												{month.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Day</Label>
								<Input
									type="number"
									min={1}
									max={31}
									value={settings.endDay}
									onChange={(e) => 
										setSettings({ 
											...settings, 
											endDay: parseInt(e.target.value) 
										})
									}
								/>
							</div>
						</div>
					</div>
					<Button 
						type="submit" 
						disabled={updateSettings.isPending}
						className="w-full"
					>
						{updateSettings.isPending ? "Saving..." : "Save Settings"}
					</Button>
				</form>
			</CardContent>
		</Card>

		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Calendars</CardTitle>
				<Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
					<DialogTrigger asChild>
						<Button>Add Calendar</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Calendar</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCalendarSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label>Name</Label>
								<Input
									value={calendar.name}
									onChange={(e) => setCalendar({ ...calendar, name: e.target.value })}
									placeholder="e.g., Main Calendar 2024-2025"
								/>
							</div>
							<div className="space-y-2">
								<Label>Description</Label>
								<Input
									value={calendar.description}
									onChange={(e) => setCalendar({ ...calendar, description: e.target.value })}
									placeholder="Calendar description"
								/>
							</div>
							<div className="space-y-2">
								<Label>Type</Label>
								<Select
									value={calendar.type}
									onValueChange={(value) => {
										setCalendar(prev => ({ ...prev, type: value as CalendarType }));
									}}
								>

									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(CalendarType).map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button type="submit" disabled={createCalendar.isPending}>
								{createCalendar.isPending ? "Creating..." : "Create Calendar"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{calendars?.map((calendar) => (
						<div key={calendar.id} className="rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium">{calendar.name}</h4>
									<p className="text-sm text-gray-500">{calendar.description}</p>
								</div>
								<span className="text-sm text-gray-500">{calendar.type}</span>
							</div>
							<TermSettings calendarId={calendar.id} />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	</div>
);
};