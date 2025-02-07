'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Status, TeacherType } from "@prisma/client";

interface TeacherViewProps {
	teacherId: string;
	isPage?: boolean;
	onClose?: () => void;
	onEdit?: () => void;
}

interface Teacher {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	status: Status;
	teacherProfile: {
		teacherType: TeacherType;
		specialization: string | null;
		availability: string | null;
		subjects: { subject: { id: string; name: string } }[];
		classes: {
			class: {
				id: string;
				name: string;
				classGroup: { name: string }
			};
			isClassTeacher: boolean;
		}[];
	};
}

export const TeacherView = ({ teacherId, isPage = false, onClose, onEdit }: TeacherViewProps) => {
	const { data: teacher, isLoading } = api.teacher.getById.useQuery(teacherId);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!teacher) {
		return <div>Teacher not found</div>;
	}

	const content = (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4">
				<div>
					<h3 className="font-semibold">Basic Information</h3>
					<div className="mt-2 space-y-2">
						<p><span className="font-medium">Name:</span> {teacher.name}</p>
						<p><span className="font-medium">Email:</span> {teacher.email}</p>
						<p><span className="font-medium">Phone:</span> {teacher.phoneNumber}</p>
						<p><span className="font-medium">Status:</span> {teacher.status}</p>
					</div>
				</div>
				<div>
					<h3 className="font-semibold">Teaching Details</h3>
					<div className="mt-2 space-y-2">
						<p><span className="font-medium">Teacher Type:</span> {teacher.teacherProfile?.teacherType}</p>
						<p><span className="font-medium">Specialization:</span> {teacher.teacherProfile?.specialization || 'N/A'}</p>
						<p><span className="font-medium">Availability:</span> {teacher.teacherProfile?.availability || 'N/A'}</p>
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-semibold">Assigned Subjects</h3>
				<div className="mt-2 flex flex-wrap gap-2">
					{teacher.teacherProfile?.subjects.map((s) => (
						<span key={s.subject.id} className="rounded-md bg-secondary px-2 py-1 text-sm">
							{s.subject.name}
						</span>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold">Assigned Classes</h3>
				<div className="mt-2 flex flex-wrap gap-2">
					{teacher.teacherProfile?.classes.map((c) => (
						<span key={c.class.id} className="rounded-md bg-secondary px-2 py-1 text-sm">
							{`${c.class.classGroup.name} - ${c.class.name}`}
						</span>
					))}
				</div>
			</div>

			{!isPage && (
				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
					<Button onClick={onEdit}>
						Edit Teacher
					</Button>
				</div>
			)}
		</div>
	);

	if (isPage) {
		return content;
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Teacher Details</DialogTitle>
				</DialogHeader>
				{content}
			</DialogContent>
		</Dialog>
	);
};
