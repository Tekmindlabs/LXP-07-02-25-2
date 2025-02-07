'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherForm } from "@/components/dashboard/roles/super-admin/teacher/TeacherForm";
import { api } from "@/utils/api";

export default function CreateTeacherPage() {
	const router = useRouter();
	const { data: subjects } = api.subject.searchSubjects.useQuery({});
	const { data: classes } = api.class.searchClasses.useQuery({});

	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader>
					<CardTitle>Create Teacher</CardTitle>
				</CardHeader>
				<CardContent>
					<TeacherForm
						isCreate={true}
						onClose={() => router.back()}
						subjects={subjects || []}
						classes={classes || []}
					/>
				</CardContent>
			</Card>
		</div>
	);
}