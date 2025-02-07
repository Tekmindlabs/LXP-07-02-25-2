'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status } from "@prisma/client";
import { api } from "@/utils/api";
import { TeacherList } from "@/components/dashboard/roles/super-admin/teacher/TeacherList";
import { useState } from "react";

interface SearchFilters {
	search: string;
	subjectId?: string;
	classId?: string;
	status?: Status | "ALL" | undefined;
}

export default function TeacherPage() {
	const router = useRouter();
	const [filters, setFilters] = useState<SearchFilters>({
		search: "",
		subjectId: "ALL",
		classId: "ALL",
		status: undefined
	});

	const processedFilters = {
		search: filters.search,
		subjectId: filters.subjectId === "ALL" ? undefined : filters.subjectId,
		classId: filters.classId === "ALL" ? undefined : filters.classId,
		status: filters.status === "ALL" ? undefined : filters.status,
	};

	const { data: teachers, isLoading } = api.teacher.searchTeachers.useQuery(processedFilters);
	const { data: subjects } = api.subject.searchSubjects.useQuery({});
	const { data: classes } = api.class.searchClasses.useQuery({});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Teacher Management</CardTitle>
					<Button onClick={() => router.push('/dashboard/super-admin/teacher/create')}>
						Create Teacher
					</Button>
				</CardHeader>
				<CardContent>
					<div className="mb-6 space-y-4">
						<div className="flex space-x-4">
							<Input
								placeholder="Search teachers..."
								value={filters.search}
								onChange={(e) => setFilters({ ...filters, search: e.target.value })}
								className="max-w-sm"
							/>
							<Select
								value={filters.subjectId}
								onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Subject" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Subjects</SelectItem>
									{subjects?.map((subject) => (
										<SelectItem key={subject.id} value={subject.id}>
											{subject.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.classId}
								onValueChange={(value) => setFilters({ ...filters, classId: value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Class" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Classes</SelectItem>
									{classes?.map((cls) => (
										<SelectItem key={cls.id} value={cls.id}>
											{`${cls.classGroup.name} - ${cls.name}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.status}
								onValueChange={(value) => setFilters({ ...filters, status: value as Status })}
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

					<TeacherList 
						teachers={teachers || []} 
						onSelect={(id) => router.push(`/dashboard/super-admin/teacher/${id}`)}
						onEdit={(id) => router.push(`/dashboard/super-admin/teacher/${id}/edit`)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}