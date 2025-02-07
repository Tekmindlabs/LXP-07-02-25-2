'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Status, UserType } from "@prisma/client";
import { api } from "@/trpc/react";
import { type DayProps } from "react-day-picker";
import { LuUsers } from "react-icons/lu";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GradebookComponent } from "@/components/dashboard/gradebook/GradebookComponent";

type ClassDetails = {
	status: Status;
	name: string;
	id: string;
	createdAt: Date;
	updatedAt: Date;
	classGroupId: string;
	capacity: number;
	students: Array<{
		id: string;
		user: {
			name: string | null;
			email: string | null;
		};
	}>;
	teachers: Array<{
		teacher: {
			id: string;
			user: {
				name: string | null;
			};
		};
	}>;
	classGroup: {
		name: string;
		program: {
			name: string;
		};
		calendar?: {
			events: Array<{
				id: string;
				title: string;
				description: string | null;
				startDate: Date;
				endDate: Date;
				type: string;
			}>;
		};
	};
	timetables: Array<{
		periods: Array<{
			startTime: string;
			endTime: string;
			dayOfWeek: string;
		}>;
	}>;
};

type StudentProfile = {
	status: Status;
	email: string | null;
	name: string | null;
	id: string;
	phoneNumber: string | null;
	emailVerified: Date | null;
	image: string | null;
	userType: UserType | null;
};

interface ClassDetailsViewProps {
	classId: string;
}


export const ClassDetailsView = ({ classId }: ClassDetailsViewProps) => {
	const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
	const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

	const { data: classDetails, error: classError, isLoading } = api.class.getClassDetails.useQuery(
		{ id: classId },
		{ retry: false }
	) as { 
		data: ClassDetails | undefined;
		error: unknown;
		isLoading: boolean;
	};

	const { data: studentProfile } = api.student.getStudentProfile.useQuery(
		{ id: selectedStudentId! },
		{ enabled: !!selectedStudentId }
	) as { data: StudentProfile | undefined };

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (classError || !classDetails) {
		return (
			<div className="p-4 text-center">
				<p className="text-destructive">Failed to load class details. Please try again later.</p>
			</div>
		);
	}

	const renderCalendarDay = (props: DayProps) => {
		const { day, ...rest } = props;
		const events = classDetails.classGroup.calendar?.events?.filter(
			(event) => isSameDay(new Date(event.startDate), day.date)
		) ?? [];

		return (
			<td role="gridcell">
				<div
					{...rest}
					className={cn(
						'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
						rest.className,
						events.length > 0 && 'bg-primary/10 hover:bg-primary/20'
					)}
				>
					<time
						dateTime={format(day.date, 'yyyy-MM-dd')}
						className="mx-auto flex h-9 w-9 items-center justify-center rounded-md"
					>
						{format(day.date, 'd')}
					</time>
					{events.length > 0 && (
						<div className="absolute bottom-1 right-1">
							<CalendarIcon className="h-3 w-3 text-primary" />
						</div>
					)}
				</div>
			</td>
		);
	};


	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{classDetails.name} - Class Dashboard</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Students</CardTitle>
						<LuUsers className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{classDetails.students.length}</div>
						<p className="text-xs text-muted-foreground">
							Capacity: {classDetails.capacity}
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="students">Students</TabsTrigger>
					<TabsTrigger value="teachers">Teachers</TabsTrigger>
					<TabsTrigger value="gradebook">Gradebook</TabsTrigger>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<Card>
						<CardHeader>
							<CardTitle>Class Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Program</p>
									<p>{classDetails.classGroup.program.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Class Group</p>
									<p>{classDetails.classGroup.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Capacity</p>
									<p>{classDetails.capacity}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Status</p>
									<Badge variant={classDetails.status === Status.ACTIVE ? "outline" : "secondary"}>
										{classDetails.status}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="students">

					<Card>
						<CardHeader>
							<CardTitle>Students List</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{classDetails.students.map((student) => (
										<TableRow key={student.id}>
											<TableCell>{student.user.name}</TableCell>
											<TableCell>{student.user.email}</TableCell>
											<TableCell>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setSelectedStudentId(student.id)}
												>
													View Profile
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="teachers">
					<Card>
						<CardHeader>
							<CardTitle>Teaching Staff</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{classDetails.teachers.map((teacher) => (
										<TableRow key={teacher.teacher.id}>
											<TableCell>{teacher.teacher.user.name}</TableCell>
											<TableCell>Subject Teacher</TableCell>
											<TableCell>
												<Badge variant="outline">Active</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="gradebook">
					<GradebookComponent 
						classId={classDetails.id}
						type="teacher"
					/>
				</TabsContent>


				<TabsContent value="calendar">
					<Card>
						<CardHeader>
							<CardTitle>Class Calendar</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Calendar
										mode="single"
										selected={selectedCalendarDate}
										onSelect={(date) => date && setSelectedCalendarDate(date)}
										className="rounded-md border"
										components={{
											Day: renderCalendarDay
										}}
									/>
								</div>
								<div>
									<h3 className="font-medium mb-4">Events for {format(selectedCalendarDate, 'PPPP')}</h3>
									<div className="space-y-4">
										{classDetails.classGroup.calendar?.events
											?.filter((event) => 
												isSameDay(new Date(event.startDate), selectedCalendarDate)
											)
											.map((event) => (
												<div key={event.id} className="p-4 border rounded-lg">
													<div className="flex items-center justify-between">
														<h4 className="font-medium">{event.title}</h4>
														<Badge>{event.type}</Badge>
													</div>
													{event.description && (
														<p className="text-sm text-muted-foreground mt-2">
															{event.description}
														</p>
													)}
													<div className="text-sm text-muted-foreground mt-2">
														<time>
															{format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}
														</time>
													</div>
												</div>
											))}
										{(!classDetails.classGroup.calendar?.events?.some((event) => 
											isSameDay(new Date(event.startDate), selectedCalendarDate)
										)) && (
											<p className="text-muted-foreground text-center py-4">
												No events scheduled for this day
											</p>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{selectedStudentId && (
				<Dialog open={!!selectedStudentId} onOpenChange={() => setSelectedStudentId(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Student Information</DialogTitle>
						</DialogHeader>
						{studentProfile && (
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-medium">{studentProfile.name}</h3>
									<p className="text-sm text-gray-500">{studentProfile.email}</p>
								</div>
								<div className="flex justify-end">
									<Button
										variant="default"
										onClick={() => {
											window.location.href = `/dashboard/super-admin/student/${studentProfile.id}`;
										}}
									>
										View Full Profile
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};
