import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
	startTime: z.string(),
	endTime: z.string(),
	dayOfWeek: z.number().min(1).max(7),
	subjectId: z.string(),
	classroomId: z.string(),
	teacherId: z.string(),
});

interface PeriodDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: any) => void;
	selectedDate: Date;
	period?: any;
	timetableId: string;
}

export default function PeriodDialog({
	isOpen,
	onClose,
	onSave,
	selectedDate,
	period,
	timetableId,
}: PeriodDialogProps) {
	const { data: subjects } = api.subject.list.useQuery();
	const { data: classrooms } = api.classroom.list.useQuery();
	const { data: teachers } = api.teacher.searchTeachers.useQuery({});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			startTime: period?.startTime ? format(new Date(period.startTime), "HH:mm") : "09:00",
			endTime: period?.endTime ? format(new Date(period.endTime), "HH:mm") : "10:00",
			dayOfWeek: period?.dayOfWeek || 1,
			subjectId: period?.subjectId || "",
			classroomId: period?.classroomId || "",
			teacherId: period?.teacherId || "",
		},
	});

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		onSave(data);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{period ? 'Edit Period' : 'Add Period'}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="dayOfWeek"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Day of Week</FormLabel>
									<Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
										<SelectTrigger>
											<SelectValue placeholder="Select day" />
										</SelectTrigger>
										<SelectContent>
											{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
												<SelectItem key={index + 1} value={(index + 1).toString()}>
													{day}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<Input type="time" {...field} />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<Input type="time" {...field} />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="subjectId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Subject</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger>
											<SelectValue placeholder="Select subject" />
										</SelectTrigger>
										<SelectContent>
											{subjects?.map((subject) => (
												<SelectItem key={subject.id} value={subject.id}>
													{subject.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="teacherId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Teacher</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger>
											<SelectValue placeholder="Select teacher" />
										</SelectTrigger>
										<SelectContent>
											{teachers?.map((teacher) => (
												<SelectItem key={teacher.id} value={teacher.id}>
													{teacher.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="classroomId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Classroom</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger>
											<SelectValue placeholder="Select classroom" />
										</SelectTrigger>
										<SelectContent>
											{classrooms?.map((classroom) => (
												<SelectItem key={classroom.id} value={classroom.id}>
													{classroom.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-2">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit">
								{period ? 'Update' : 'Add'} Period
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
