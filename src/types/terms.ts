export type TermType = 'SEMESTER' | 'TERM' | 'QUARTER';

export interface TermAssessmentPeriod {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	weight: number;
}

export interface AcademicTerm {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	type: TermType;
	calendarTermId?: string;
	assessmentPeriods: TermAssessmentPeriod[];
}

export interface ProgramTermStructure {
	id: string;
	programId: string;
	academicYearId: string;
	academicTerms: AcademicTerm[];
}

export interface ClassGroupTermSettings {
	id: string;
	classGroupId: string;
	programTermId: string;
	customSettings?: {
		startDate?: Date;
		endDate?: Date;
		assessmentPeriods?: TermAssessmentPeriod[];
	};
}

export const termConfigs = {
	semesterBased: {
		terms: [
			{ name: 'Semester 1', duration: 'months', value: 6 },
			{ name: 'Semester 2', duration: 'months', value: 6 }
		]
	},
	termBased: {
		terms: [
			{ name: 'Term 1', duration: 'months', value: 4 },
			{ name: 'Term 2', duration: 'months', value: 4 },
			{ name: 'Term 3', duration: 'months', value: 4 }
		]
	}
} as const;