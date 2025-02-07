export interface GradeDistribution {
	A: number;
	B: number;
	C: number;
	D: number;
	F: number;
}

export interface GradebookOverviewData {
	classAverage: number;
	highestGrade: number;
	lowestGrade: number;
	distribution: GradeDistribution;
	totalStudents: number;
}

export interface ActivitySubmission {
	studentId: string;
	studentName: string;
	grade?: number;
	submitted: boolean;
}

export interface Activity {
	id: string;
	title: string;
	deadline: Date | null;
	submissions: ActivitySubmission[];
}

export interface ActivityGrade {
	activityId: string;
	activityName: string;
	grade: number;
	totalPoints: number;
}


export interface StudentGrade {
	studentId: string;
	studentName: string;
	overallGrade: number;
	activityGrades: ActivityGrade[];
}

export interface GradebookData {
	overview: GradebookOverviewData;
	activities: Activity[];
	studentGrades: StudentGrade[];
}