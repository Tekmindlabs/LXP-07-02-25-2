import { Prisma } from "@prisma/client";

export interface ActivitySubmissionBasic {
	id: string;
	status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSED';
	submittedAt: Date;
	studentId: string;
	obtainedMarks: number | null;
	totalMarks: number | null;
	feedback: string | null;
	content: Prisma.JsonValue;
	isPassing: boolean;
	gradingType: 'AUTOMATIC' | 'MANUAL';
	gradedBy?: string;
	gradedAt?: Date;
	student: {
		id: string;
		name: string | null;
	};
}


export interface ActivityWithBasicSubmissions {
	id: string;
	title: string;
	description: string | null;
	type: ActivityType;
	status: ActivityStatus;
	deadline: Date | null;
	classId: string | null;
	classGroupId: string | null;
	subjectId: string;
	gradingCriteria: string | null;
	class: {
		name: string;
	} | null;
	classGroup: {
		name: string;
	} | null;
	submissions: ActivitySubmissionBasic[];
}

export type ActivityType =
	// Online Activities (Auto-graded)
	| 'QUIZ_MULTIPLE_CHOICE'
	| 'QUIZ_DRAG_DROP'
	| 'QUIZ_FILL_BLANKS'
	| 'QUIZ_MEMORY'
	| 'QUIZ_TRUE_FALSE'
	| 'GAME_WORD_SEARCH'
	| 'GAME_CROSSWORD'
	| 'GAME_FLASHCARDS'
	| 'VIDEO_YOUTUBE'
	| 'READING'
	// In-Class Activities (Manually graded)
	| 'CLASS_ASSIGNMENT'
	| 'CLASS_PROJECT'
	| 'CLASS_PRESENTATION'
	| 'CLASS_TEST'
	| 'CLASS_EXAM';


export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSED';

export interface ActivityTemplate {
	id: string;
	type: ActivityType;
	title: string;
	description?: string;
	configuration: ActivityConfiguration;
}

export interface ActivityConfiguration {
	timeLimit?: number;
	attempts?: number;
	totalMarks: number;
	passingMarks: number;
	activityMode: 'ONLINE' | 'IN_CLASS';
	gradingType: 'AUTOMATIC' | 'MANUAL';
	isGraded: boolean;
	instructions?: string;
	availabilityDate?: Date;
	deadline?: Date;
	viewType: 'PREVIEW' | 'STUDENT' | 'CONFIGURATION';
	autoplay?: boolean;
	showControls?: boolean;
	showExamples?: boolean;
}

export interface ActivitySubmission {
	id: string;
	activityId: string;
	studentId: string;
	submittedAt: Date;
	content: Prisma.JsonValue;
	totalMarks: number;
	obtainedMarks: number;
	isPassing: boolean;
	gradingType: 'AUTOMATIC' | 'MANUAL';
	gradedBy?: string;
	gradedAt?: Date;
	feedback?: string;
	status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSED';
}

export interface GradingResult {
	grade: number;
	feedback?: string;
	gradedBy?: string;
	gradedAt: Date;
}

export interface MultipleChoiceConfig extends ActivityConfiguration {
	questions: {
		text: string;
		options: string[];
		correctAnswer: number;
	}[];

}

export interface DragDropConfig extends ActivityConfiguration {
	items: {
		draggableId: string;
		content: string;
		correctZoneId: string;
	}[];
	dropZones: {
		zoneId: string;
		label: string;
	}[];
}

export interface FillBlanksConfig extends ActivityConfiguration {
	text: string;
	blanks: {
		id: string;
		correctAnswer: string;
		position: number;
	}[];
}

export interface WordSearchConfig extends ActivityConfiguration {
	words: string[];
	gridSize: {
		rows: number;
		cols: number;
	};
	orientations: {
		horizontal: boolean;
		vertical: boolean;
		diagonal: boolean;
		reverseHorizontal: boolean;
		reverseVertical: boolean;
		reverseDiagonal: boolean;
	};
	difficulty: 'easy' | 'medium' | 'hard';
	timeLimit?: number;
	showWordList: boolean;
	fillRandomLetters: boolean;
}

export interface FlashcardConfig extends ActivityConfiguration {
	cards: {
		front: string;
		back: string;
	}[];
}

export interface VideoConfig extends ActivityConfiguration {
	videoUrl: string;
	autoplay: boolean;
	showControls: boolean;
}

export interface ReadingConfig extends ActivityConfiguration {
	content: string;
	examples: string[];
	showExamples: boolean;
}

export interface ClassActivity {
	id: string;
	title: string;
	description?: string;
	type: ActivityType;
	status: ActivityStatus;
	deadline?: Date;
	classId?: string;
	classGroupId?: string;
	gradingCriteria?: string;
	resources?: ActivityResource[];
	configuration?: ActivityConfiguration;
	createdAt: Date;
	updatedAt: Date;
}

export interface ActivityResource {
	id: string;
	title: string;
	type: 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'LINK' | 'IMAGE';
	url: string;
	activityId: string;
}

export interface ClassActivityFilters {
	type: ActivityType | null;
	status: ActivityStatus | null;
	dateRange: {
		from: Date;
		to: Date;
	} | null;
}