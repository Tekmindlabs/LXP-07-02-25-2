'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import { LuUsers, LuBookOpen, LuGraduationCap, LuTrendingUp } from "react-icons/lu";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { Class, TeacherClass, StudentProfile } from "@prisma/client";
import { DateRange } from "react-day-picker";

interface PerformanceData {
	date: string;
	averageScore: number;
}

interface AttendanceTrend {
	date: string;
	attendanceRate: number;
}

interface ClassWithRelations extends Class {
	students: StudentProfile[];
	teachers: TeacherClass[];
}

interface ClassGroupDetailsViewProps {
	classGroupId: string;
}

const validatePerformanceData = (data?: { data: PerformanceData[] }) => {
	if (!data?.data?.length) return false;
	return data.data?.every(item => 
		typeof item.averageScore === 'number' &&
		typeof item.date === 'string'
	);
};

const validateAttendanceData = (data?: { trends: AttendanceTrend[] }) => {
	if (!data?.trends?.length) return false;
	return data.trends?.every(item => 
		typeof item.attendanceRate === 'number' &&
		typeof item.date === 'string'
	);
};

export const ClassGroupDetailsView = ({ classGroupId }: ClassGroupDetailsViewProps) => {
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
		to: new Date()
	});

	const { data: classGroup, isLoading } = api.classGroup.getClassGroupWithDetails.useQuery(
		classGroupId
	);

	const { data: historicalData, error: historicalError } = api.classGroup.getHistoricalAnalytics.useQuery({
		id: classGroupId,
		startDate: dateRange.from!,
		endDate: dateRange.to!
	}, {
		enabled: !!dateRange.from && !!dateRange.to,
		staleTime: 30000,
		gcTime: 60000,
		retry: 2
	});

	const { data: performanceTrends, error: performanceError } = api.classGroup.getPerformanceTrends.useQuery({
		id: classGroupId,
		startDate: dateRange.from!,
		endDate: dateRange.to!
	}, {
		enabled: !!dateRange.from && !!dateRange.to,
		staleTime: 30000,
		gcTime: 60000,
		retry: 2
	});

	const { data: attendanceStats, error: attendanceError } = api.classGroup.getAttendanceStats.useQuery({
		id: classGroupId,
		startDate: dateRange.from!,
		endDate: dateRange.to!
	}, {
		enabled: !!dateRange.from && !!dateRange.to,
		staleTime: 30000,
		gcTime: 60000,
		retry: 2
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	const hasError = historicalError || performanceError || attendanceError;
	if (hasError || !classGroup) {
		return (
			<div className="p-4 text-center">
				<p className="text-destructive">
					{historicalError?.message || performanceError?.message || 
					 attendanceError?.message || "Failed to load class group details."}
				</p>
			</div>
		);
	}

	// Calculate current analytics with proper typing
	const totalStudents = classGroup.classes.reduce((acc: number, cls: ClassWithRelations) => 
		acc + cls.students.length, 0);
	const totalTeachers = classGroup.classes.reduce((acc: number, cls: ClassWithRelations) => 
		acc + cls.teachers.length, 0);
	const totalSubjects = classGroup.subjects.length;

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{classGroup.name}</h1>
				<Badge variant={classGroup.status === "ACTIVE" ? "default" : "secondary"}>
					{classGroup.status}
				</Badge>
			</div>

			{/* Date Range Picker */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">Analytics Period</h3>
						<DatePickerWithRange
							value={dateRange}
							onChange={(range) => {
								if (range?.from && range?.to) {
									setDateRange(range);
								}
							}}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Students</CardTitle>
						<LuUsers className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalStudents}</div>
						{historicalData?.studentGrowth && (
							<p className={`text-sm ${historicalData.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
								{historicalData.studentGrowth > 0 ? '+' : ''}{historicalData.studentGrowth.toFixed(1)}% from last period
							</p>
						)}
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
						<LuGraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalTeachers}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
						<LuBookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalSubjects}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Average Performance</CardTitle>
						<LuTrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs Section */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="attendance">Attendance</TabsTrigger>
					<TabsTrigger value="activities">Activities</TabsTrigger>
					<TabsTrigger value="classes">Classes</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<Card>
						<CardHeader>
							<CardTitle>Performance Overview</CardTitle>
						</CardHeader>
						<CardContent>
							{validatePerformanceData(performanceTrends) ? (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={performanceTrends?.data}>
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
				</TabsContent>

				<TabsContent value="performance">
					<Card>
						<CardHeader>
							<CardTitle>Subject-wise Performance</CardTitle>
						</CardHeader>
						<CardContent>
							{performanceTrends?.subjectWise && (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={performanceTrends.subjectWise}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="subject" />
										<YAxis />
										<Tooltip />
										<Bar dataKey="averageScore" fill="#8884d8" />
									</BarChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="attendance">
					<Card>
						<CardHeader>
							<CardTitle>Attendance Trends</CardTitle>
						</CardHeader>
						<CardContent>
							{validateAttendanceData(attendanceStats) ? (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={attendanceStats?.trends}>
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
				</TabsContent>
			</Tabs>
		</div>
	);
};