'use client'

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; 
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PeriodDialog from "./PeriodDialog";

type Term = {
	id: string;
	name: string;
};
  
type ClassGroup = {
	id: string;
	name: string;
};
  
type Class = {
	id: string;
	name: string;
};


const periodSchema = z.object({
	startTime: z.string(),
	endTime: z.string(),
	dayOfWeek: z.number().min(1).max(7),
	subjectId: z.string(),
	classroomId: z.string(),
	teacherId: z.string(),
});

const formSchema = z.object({
	termId: z.string().min(1, "Term is required"),
	classGroupId: z.string(),
	classId: z.string(),
	periods: z.array(periodSchema),
});

type TimetableFormProps = {
	onCancel: () => void;
};

export default function TimetableForm({ onCancel }: TimetableFormProps) {
	const { toast } = useToast();
	const utils = api.useContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
	const [periods, setPeriods] = useState<z.infer<typeof periodSchema>[]>([]);

	const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");
	const { data: terms } = api.term.getByCalendar.useQuery(selectedCalendarId, {
		enabled: !!selectedCalendarId
	});
	const { data: classGroups } = api.classGroup.list.useQuery();
	const { data: classes } = api.class.list.useQuery();


	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			periods: [],
		},
	});

	const createTimetable = api.timetable.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Timetable created successfully",
			});
			utils.timetable.invalidate();
			onCancel();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const handleAddPeriod = () => {
		setSelectedPeriod(null);
		setIsDialogOpen(true);
	};

	const handleEditPeriod = (period: any, index: number) => {
		setSelectedPeriod({ ...period, index });
		setIsDialogOpen(true);
	};

	const handlePeriodSave = (periodData: any) => {
		if (selectedPeriod) {
			const newPeriods = [...periods];
			newPeriods[selectedPeriod.index] = periodData;
			setPeriods(newPeriods);
		} else {
			setPeriods([...periods, periodData]);
		}
		setIsDialogOpen(false);
	};

	const removePeriod = (index: number) => {
		setPeriods(periods.filter((_, i) => i !== index));
	};

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		const formData = {
			termId: data.termId,
			classGroupId: data.classGroupId === "NO_SELECTION" ? "" : data.classGroupId,
			classId: data.classId === "NO_SELECTION" ? "" : data.classId,
			periods: periods
				.filter(period => period.subjectId !== "NO_SELECTION" && period.classroomId !== "NO_SELECTION" && period.teacherId !== "NO_SELECTION")
				.map(period => ({
					startTime: new Date(`1970-01-01T${period.startTime}`),
					endTime: new Date(`1970-01-01T${period.endTime}`),
					subjectId: period.subjectId,
					classroomId: period.classroomId,
					teacherId: period.teacherId,
					dayOfWeek: period.dayOfWeek,
					durationInMinutes: 45,
				})),
		};

		if (!formData.classGroupId && !formData.classId) {
			toast({
				title: "Error",
				description: "Either Class Group or Class must be selected",
				variant: "destructive",
			});
			return;
		}

		createTimetable.mutate(formData);
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="termId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Term</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select term" />
									</SelectTrigger>
									<SelectContent>
										{terms?.map((term: Term) => (
											<SelectItem key={term.id} value={term.id}>
												{term.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="classGroupId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Class Group (Optional)</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select class group" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NO_SELECTION">Select Class Group</SelectItem>
										{classGroups?.map((group: ClassGroup) => (
											<SelectItem key={group.id} value={group.id}>
												{group.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="classId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Class (Optional)</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select class" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="NO_SELECTION">Select Class</SelectItem>
										{classes?.map((cls: Class) => (
											<SelectItem key={cls.id} value={cls.id}>
												{cls.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>

					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-semibold">Periods</h3>
							<Button type="button" onClick={handleAddPeriod}>
								Add Period
							</Button>
						</div>

						{periods.map((period, index) => (
							<Card key={index} className="p-4">
								<div className="flex justify-between items-center">
									<div>
										<p>Day: {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][period.dayOfWeek - 1]}</p>
										<p>Time: {period.startTime} - {period.endTime}</p>
									</div>
									<div className="space-x-2">
										<Button type="button" variant="outline" onClick={() => handleEditPeriod(period, index)}>
											Edit
										</Button>
										<Button type="button" variant="destructive" onClick={() => removePeriod(index)}>
											Remove
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>

					<div className="flex justify-end space-x-4">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={createTimetable.isPending}>
							Create Timetable
						</Button>
					</div>
				</form>
			</Form>

			<PeriodDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSave={handlePeriodSave}
				selectedDate={new Date()}
				period={selectedPeriod}
				timetableId=""
			/>
		</>
	);
}
