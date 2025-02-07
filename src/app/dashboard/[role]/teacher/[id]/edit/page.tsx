'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherForm } from "@/components/dashboard/roles/super-admin/teacher/TeacherForm";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

export default function EditTeacherPage({ params }: { params: { role: string; id: string } }) {
	const router = useRouter();
	const teacherId = params.id;

	const { data: teacher } = api.teacher.getById.useQuery(teacherId);
	const { data: subjects } = api.subject.searchSubjects.useQuery({});
	const { data: classes } = api.class.searchClasses.useQuery({});
	const createCredentialsMutation = api.teacher.createCredentials.useMutation({
		onSuccess: () => {
			alert('Login credentials created and sent to teacher\'s email');
		},
		onError: (error) => {
			alert('Error creating credentials: ' + error.message);
		}
	});

	if (!teacher || !teacher.teacherProfile) {
		return <div>Loading...</div>;
	}

	const formattedTeacher = {
		id: teacher.id,
		name: teacher.name || '',
		email: teacher.email || '',
		phoneNumber: teacher.phoneNumber || '',
		status: teacher.status,
		teacherProfile: {
			teacherType: teacher.teacherProfile.teacherType,
			specialization: teacher.teacherProfile.specialization || '',
			availability: teacher.teacherProfile.availability || '',
			subjects: teacher.teacherProfile.subjects || [],
			classes: teacher.teacherProfile.classes || [],
		}
	};

	const handleCreateCredentials = () => {
		if (teacher.email) {
			const tempPassword = Math.random().toString(36).slice(-8); // Generate random 8-char password
			createCredentialsMutation.mutate({ 
				teacherId: teacher.id,
				password: tempPassword
			});
		} else {
			alert('Teacher must have an email address to create login credentials');
		}
	};

	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Edit Teacher</CardTitle>
					<Button 
						onClick={handleCreateCredentials}
						disabled={!teacher.email || createCredentialsMutation.isPending}
					>
						{createCredentialsMutation.isPending ? 'Creating...' : 'Create Login Credentials'}
					</Button>
				</CardHeader>
				<CardContent>
					<TeacherForm
						isCreate={false}
						selectedTeacher={formattedTeacher}
						onClose={() => router.back()}
						subjects={subjects || []}
						classes={classes || []}
					/>
				</CardContent>
			</Card>
		</div>
	);
}