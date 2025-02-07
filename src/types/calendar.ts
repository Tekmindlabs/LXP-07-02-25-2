export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	level: string;
	calendarId: string;
	programId?: string;
	classGroupId?: string;
	classId?: string;
	status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
	createdAt: Date;
	updatedAt: Date;
}

export interface TimetablePeriod {
	id: string;
	startTime: Date;
	endTime: Date;
	durationInMinutes: number;
	dayOfWeek: number;
	subjectId: string;
	classroomId: string;
	timetableId: string;
	teacherId: string;
}

export type CalendarViewMode = 'day' | 'week' | 'month';

export type EntityType = 'class' | 'class_group' | 'timetable';