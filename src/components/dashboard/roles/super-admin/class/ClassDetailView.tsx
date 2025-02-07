'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Status, UserType } from "@prisma/client";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/utils/api";
import { type CalendarDay, type Modifiers } from "react-day-picker";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { LuUsers, LuBookOpen, LuGraduationCap, LuUserCheck } from "react-icons/lu";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isSameDay } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";

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



interface Period {
	startTime: string;
	endTime: string;
	dayOfWeek: string;
}

interface ClassDetailViewProps {
	isOpen: boolean;
	onClose: () => void;
	classId: string;
}



export const ClassDetailsView = ({ isOpen, onClose, classId }: ClassDetailViewProps) => {
	const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
		to: new Date()
	});

	const { data: classDetails, error: classError, isLoading } = api.class.getClassDetails.useQuery(
		{ id: classId },
		{ 
			enabled: isOpen && !!classId,
			retry: false
		}
	) as { 
		data: ClassDetails | undefined;
		error: unknown;
		isLoading: boolean;
	};

	const { data: studentProfile } = api.student.getStudentProfile.useQuery(
		{ id: selectedStudentId! },
		{ enabled: !!selectedStudentId }
	) as { data: StudentProfile | undefined };

	const { data: historicalData } = api.class.getHistoricalAnalytics.useQuery({
		id: classId,
		startDate: dateRange.from!,
		endDate: dateRange.to!
	}, {
		enabled: isOpen && !!classId && !!dateRange.from && !!dateRange.to
	});

	const { data: performanceTrends } = api.class.getPerformanceTrends.useQuery({
		id: classId,
		startDate: dateRange.from!,
		endDate: dateRange.to!
	}, {
		enabled: isOpen && !!classId && !!dateRange.from && !!dateRange.to
	});

	const { data: attendanceStats } = api.class.getAttendanceStats.useQuery({
		id: classId,
		startDate: dateRange.from!,
		endDate: dateRange.to!
	}, {
		enabled: isOpen && !!classId && !!dateRange.from && !!dateRange.to
	});

	if (isLoading) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Loading class details...</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center p-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (classError) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-destructive">Error Loading Class Details</DialogTitle>
					</DialogHeader>
					<div className="p-4 text-center">
						<p className="text-destructive">Failed to load class details. Please try again later.</p>
						<Button 
							variant="outline" 
							onClick={onClose}
							className="mt-4"
						>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (!classDetails) return null;




	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">{classDetails.name} - Class Dashboard</DialogTitle>
				</DialogHeader>

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
					
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Class Tutor</CardTitle>
							<LuUserCheck className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{classDetails.teachers[0]?.teacher.user.name || 'Not Assigned'}</div>
						</CardContent>
					</Card>
					
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Subject Teachers</CardTitle>
							<LuBookOpen className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{classDetails.teachers.length}</div>
						</CardContent>
					</Card>
					
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">Program</CardTitle>
							<LuGraduationCap className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-lg font-bold">{classDetails.classGroup.program.name}</div>
						</CardContent>
					</Card>
				</div>
				<Tabs defaultValue="overview">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="students">Students</TabsTrigger>
						<TabsTrigger value="teachers">Teachers</TabsTrigger>
						<TabsTrigger value="calendar">Calendar</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
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
										{classDetails.students.map((student: { id: string; user: { name: string | null; email: string | null } }) => (
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
											<TableHead>Subjects</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{classDetails.teachers.map((teacher: { teacher: { id: string; user: { name: string | null } } }) => (
											<TableRow key={teacher.teacher.id}>
												<TableCell>{teacher.teacher.user.name}</TableCell>
												<TableCell>Subject Teacher</TableCell>
												<TableCell>N/A</TableCell>
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
												Day: ({ day, ...props }: { day: CalendarDay; modifiers: Modifiers } & React.HTMLAttributes<HTMLDivElement>) => {
													const events = classDetails.classGroup.calendar?.events?.filter(
														(event) => isSameDay(new Date(event.startDate), day.date)
													) ?? [];
													return (
														<div
															{...props}
															className={`relative ${props.className || ''} ${
																events.length > 0 ? "bg-primary/10" : ""
															}`}
														>
															{day.date.getDate()}
															{events.length > 0 && (
																<div className="absolute bottom-0 right-0">
																	<CalendarIcon className="h-3 w-3 text-primary" />
																</div>
															)}
														</div>
													);
												},
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

					<TabsContent value="analytics">
						<Card>
							<CardHeader>
								<CardTitle>Class Analytics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="mb-6">
									<h3 className="font-semibold mb-2">Select Date Range</h3>
									<DatePickerWithRange
										value={dateRange}
										onChange={(range) => {
											if (range?.from && range?.to) {
												setDateRange(range);
											}
										}}
									/>
								</div>

								<div className="space-y-6">
									<Card>
										<CardHeader>
											<CardTitle>Performance Trends</CardTitle>
										</CardHeader>
										<CardContent>
											{performanceTrends?.data ? (
												<ResponsiveContainer width="100%" height={300}>
													<LineChart data={performanceTrends.data}>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="date" />
														<YAxis />
														<Tooltip />
														<Line 
															type="monotone" 
															dataKey="averageScore" 
															stroke="#8884d8"
															name="Average Score"
														/>
													</LineChart>
												</ResponsiveContainer>
											) : (
												<div className="text-center p-4 text-muted-foreground">
													No performance data available for the selected period.
												</div>
											)}
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Attendance Trends</CardTitle>
										</CardHeader>
										<CardContent>
											{attendanceStats?.trends ? (
												<ResponsiveContainer width="100%" height={300}>
													<LineChart data={attendanceStats.trends}>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="date" />
														<YAxis />
														<Tooltip />
														<Line 
															type="monotone" 
															dataKey="attendanceRate" 
															stroke="#82ca9d"
															name="Attendance Rate"
														/>
													</LineChart>
												</ResponsiveContainer>
											) : (
												<div className="text-center p-4 text-muted-foreground">
													No attendance data available for the selected period.
												</div>
											)}
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>Subject Performance</CardTitle>
										</CardHeader>
										<CardContent>
											{performanceTrends?.subjectWise ? (
												<ResponsiveContainer width="100%" height={300}>
													<BarChart data={performanceTrends.subjectWise}>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="subject" />
														<YAxis />
														<Tooltip />
														<Bar 
															dataKey="averageScore" 
															fill="#8884d8"
															name="Average Score"
														/>
													</BarChart>
												</ResponsiveContainer>
											) : (
												<div className="text-center p-4 text-muted-foreground">
													No subject performance data available for the selected period.
												</div>
											)}
										</CardContent>
									</Card>
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

			</DialogContent>
		</Dialog>
	);
};