'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Status, TeacherType } from "@prisma/client";
import { Teacher } from "@/types/user";

interface TeacherListProps {

	teachers: Teacher[];
	onSelect: (id: string) => void;
	onEdit: (id: string) => void;
}

export const TeacherList = ({ teachers, onSelect, onEdit }: TeacherListProps) => {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Teacher Type</TableHead>
						<TableHead>Specialization</TableHead>
						<TableHead>Availability</TableHead>
						<TableHead>Subjects</TableHead>
						<TableHead>Classes</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{teachers.map((teacher) => (
						<TableRow key={teacher.id}>
							<TableCell>{teacher.name || '-'}</TableCell>
							<TableCell>{teacher.email || '-'}</TableCell>
							<TableCell>
								<Badge variant="outline">
									{teacher.teacherProfile?.teacherType || 'SUBJECT'}
								</Badge>
							</TableCell>
							<TableCell>{teacher.teacherProfile?.specialization || '-'}</TableCell>
							<TableCell>{teacher.teacherProfile?.availability || '-'}</TableCell>
							<TableCell>
								{teacher.teacherProfile?.subjects.map(s => s.subject.name).join(", ") || '-'}
							</TableCell>
							<TableCell>
								{teacher.teacherProfile?.classes.map(c => 
									`${c.class.name} (${c.class.classGroup.name})`
								).join(", ") || '-'}
							</TableCell>
							<TableCell>
								<Badge variant={teacher.status === "ACTIVE" ? "default" : "secondary"}>
									{teacher.status}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onSelect(teacher.id)}
									>
										View
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(teacher.id)}
									>
										Edit
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};