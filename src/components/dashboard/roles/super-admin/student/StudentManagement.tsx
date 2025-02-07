'use client';

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status } from "@prisma/client";
import { api } from "@/utils/api";
import { StudentList } from "./StudentList";
import { StudentForm } from "./StudentForm";
import { StudentDetails } from "./StudentDetails";
import { BulkStudentUpload } from "./BulkStudentUpload";

interface SearchFilters {
	search: string;
	classId?: string;
	programId?: string;
	status?: Status;
}





export const StudentManagement = () => {
	const router = useRouter();
	const params = useParams();
	const role = params.role as string;
	const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
	const [showDetails, setShowDetails] = useState(false);
	const [filters, setFilters] = useState<SearchFilters>({
		search: "",
	});

	const { data: studentsData, isLoading } = api.student.searchStudents.useQuery(filters);

	const students = studentsData?.map(student => ({
		id: student.id,
		name: student.name,
		email: student.email,
		status: student.status,
		studentProfile: {
			dateOfBirth: student.studentProfile.dateOfBirth,
			class: student.studentProfile.class ? {
				id: student.studentProfile.class.id,
				name: student.studentProfile.class.name,
				classGroup: {
					id: student.studentProfile.class.classGroup.id,
					name: student.studentProfile.class.classGroup.name,
					program: {
						id: student.studentProfile.class.classGroup.program.id,
						name: student.studentProfile.class.classGroup.program.name
					}
				}
			} : null,
			parent: student.studentProfile.parent ? {
				user: {
					name: student.studentProfile.parent.user.name
				}
			} : null,
			attendance: [],
			activities: []
		}
	})) || [];

	const { data: classes } = api.class.searchClasses.useQuery({});
	const { data: programs } = api.program.getAll.useQuery({
		page: 1,
		pageSize: 10
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}


	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Student Management</CardTitle>
					<div className="flex items-center gap-4">
						<BulkStudentUpload />
						<Button onClick={() => router.push(`/dashboard/${role}/student/create`)}>
							Enroll Student
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-6 space-y-4">
						<div className="flex space-x-4">
							<Input
								placeholder="Search students..."
								value={filters.search}
								onChange={(e) => setFilters({ ...filters, search: e.target.value })}
								className="max-w-sm"
							/>
							<Select
								value={filters.programId || "ALL"}
								onValueChange={(value) => setFilters({ ...filters, programId: value === "ALL" ? undefined : value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Program" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Programs</SelectItem>
									{programs?.programs?.map((program: any) => (
										<SelectItem key={program.id} value={program.id}>
											{program.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.classId || "ALL"}
								onValueChange={(value) => setFilters({ ...filters, classId: value === "ALL" ? undefined : value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Class" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Classes</SelectItem>
									{classes?.map((cls) => (
										<SelectItem key={cls.id} value={cls.id}>
											{cls.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.status || "ALL"}
								onValueChange={(value) => setFilters({ ...filters, status: value === "ALL" ? undefined : value as Status })}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Status</SelectItem>
									{Object.values(Status).map((status) => (
										<SelectItem key={status} value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-4">
						{showDetails && selectedStudentId ? (
							<StudentDetails 
								studentId={selectedStudentId}
								onBack={() => {
									setShowDetails(false);
									setSelectedStudentId(null);
								}}
							/>
						) : (
							<>
								<StudentList 
									students={students} 
									onSelect={(id) => {
										setSelectedStudentId(id);
										setShowDetails(true);
									}}
								/>
								<StudentForm 
									selectedStudent={students.find(s => s.id === selectedStudentId)}
									classes={classes || []}
									onSuccess={() => setSelectedStudentId(null)}
								/>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
