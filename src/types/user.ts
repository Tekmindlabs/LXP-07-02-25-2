import { Status, AttendanceStatus } from "@prisma/client";

export enum TeacherType {
	CLASS = "CLASS",
	SUBJECT = "SUBJECT"
}

export interface Student {
	id: string;
	name: string | null;
	email: string | null;
	status: Status;
	studentProfile: {
		dateOfBirth: Date | null;
		class?: {
			id: string;
			name: string;
			classGroup: {
				id: string;
				name: string;
				program: {
					id: string;
					name: string | null;
				};
			};
		} | null;
		parent?: {
			user: {
				name: string | null;
			};
		} | null;
		attendance: {
			status: AttendanceStatus;
		}[];
		activities: {
			status: string;
			grade: number | null;
		}[];
	};
}


export interface Teacher {
	id: string;
	name: string | null;
	email: string | null;
	phoneNumber: string | null;
	status: Status;
	teacherProfile: {
		teacherType: TeacherType;
		specialization: string | null;
		availability: string | null;
		permissions: string[];
		subjects: {
			subject: {
				id: string;
				name: string;
			};
			status: Status;
		}[];
		classes: {
			class: {
				id: string;
				name: string;
				classGroup: {
					name: string;
				};
			};
			status: Status;
			isClassTeacher: boolean;
		}[];
	} | null;
}
