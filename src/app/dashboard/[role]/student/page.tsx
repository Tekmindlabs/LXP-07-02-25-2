'use client';

import { use } from 'react';
import { StudentManagement } from "@/components/dashboard/roles/super-admin/student/StudentManagement";

type PageProps = {
	params: {
		role: string;
	};
};

export default function StudentPage({ params }: PageProps) {
	const { role } = use(params as PageProps['params']);

	return (
		<div className="container mx-auto py-6">
			<StudentManagement />
		</div>
	);
}
