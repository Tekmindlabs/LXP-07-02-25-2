import { AttendanceRecord } from './attendance';
import { z } from 'zod';

export interface GradeRecord {
	id: string;
	activityId: string;
	grade: number;
	feedback?: string;
	submittedAt: Date;
	gradedAt: Date;
}

export interface HistoricalStudentRecord {
	id: string;
	studentId: string;
	academicYear: string;
	term: string;
	grades: GradeRecord[];
	attendance: AttendanceRecord[];
	timestamp: Date;
}

export interface VersionedRecord {
	id: string;
	entityId: string;
	entityType: 'STUDENT' | 'TEACHER' | 'CLASS';
	changes: Record<string, any>;
	timestamp: Date;
	userId: string;
}

export interface PerformanceMetrics {
	periodStart: Date;
	periodEnd: Date;
	metrics: {
		academicPerformance: number;
		attendanceRate: number;
		participationScore: number;
	};
}

export interface DataRetentionPolicy {
	entityType: string;
	retentionPeriod: number;
	archivalStrategy: 'ARCHIVE' | 'DELETE';
	complianceRequirements: string[];
}

export const gradeRecordSchema = z.object({
	id: z.string(),
	activityId: z.string(),
	grade: z.number(),
	feedback: z.string().optional(),
	submittedAt: z.date(),
	gradedAt: z.date()
});

export const historicalStudentRecordSchema = z.object({
	id: z.string(),
	studentId: z.string(),
	academicYear: z.string(),
	term: z.string(),
	grades: z.array(gradeRecordSchema),
	attendance: z.array(z.any()),
	timestamp: z.date()
});