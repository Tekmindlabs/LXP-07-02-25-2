import { Card, CardContent } from "@/components/ui/card";

interface AttendanceDashboardProps {
	attendanceTrend?: {
		date: string;
		percentage: number;
	}[];
	classAttendance?: {
		className: string;
		present: number;
		absent: number;
		percentage: number;
	}[];
}

export function AttendanceDashboard({
	attendanceTrend = [],
	classAttendance = []
}: AttendanceDashboardProps) {
	const totalStudents = classAttendance.reduce((acc, curr) => acc + curr.present + curr.absent, 0);
	const averageAttendance = classAttendance.reduce((acc, curr) => acc + curr.percentage, 0) / (classAttendance.length || 1);

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent className="p-6">
					<div className="text-2xl font-bold">{totalStudents}</div>
					<p className="text-xs text-muted-foreground">Total Students</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-6">
					<div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
					<p className="text-xs text-muted-foreground">Average Attendance</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-6">
					<div className="text-2xl font-bold">
						{classAttendance.length}
					</div>
					<p className="text-xs text-muted-foreground">Active Classes</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="p-6">
					<div className="text-2xl font-bold">
						{attendanceTrend.length}
					</div>
					<p className="text-xs text-muted-foreground">Days Recorded</p>
				</CardContent>
			</Card>
		</div>
	);
}
