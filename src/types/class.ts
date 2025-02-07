import { Status } from "@prisma/client";

export interface Class {
    id: string;
    name: string;
    capacity: number;
    status: Status;
    description?: string;
    academicYear?: string;
    semester?: string;
    classGroup: {
        id: string;
        name: string;
        program: {
            id: string;
            name: string;
        };
    };
    students: {
        id: string;
        user: {
            name: string;
            email?: string;
        };
    }[];
    teachers: {
        teacher: {
            id: string;
            user: {
                name: string;
                email?: string;
            };
        };
        isClassTutor?: boolean;
        subjects?: {
            id: string;
            name: string;
        }[];
    }[];
}

export interface ClassStats {
    totalStudents: number;
    activeStudents: number;
    averageAttendance: number;
    averagePerformance: number;
}

export interface ClassActivity {
    id: string;
    type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM';
    title: string;
    deadline?: Date;
    status: 'PENDING' | 'COMPLETED' | 'GRADED';
    averageScore?: number;
}