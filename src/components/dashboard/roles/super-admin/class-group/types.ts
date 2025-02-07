export interface HistoricalAnalytics {
	studentGrowth: number;
	historicalData: Array<{
		timestamp: Date;
		grades: Array<any>; // Replace with specific grade type if available
	}>;
}

export interface PerformanceData {
	date: string;
	averageScore: number;
}

export interface SubjectPerformance {
	subject: string;
	averageScore: number;
}

export interface PerformanceTrends {
	data: PerformanceData[];
	subjectWise: SubjectPerformance[];
}

export interface AttendanceTrend {
	date: string;
	attendanceRate: number;
}

export interface AttendanceStats {
	trends: AttendanceTrend[];
	averageAttendance: number;
}