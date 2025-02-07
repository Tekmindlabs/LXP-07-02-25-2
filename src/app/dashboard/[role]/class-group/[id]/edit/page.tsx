'use client';

import { useParams } from 'next/navigation';
import { ClassGroupForm } from "@/components/dashboard/roles/super-admin/class-group/ClassGroupForm";
import { api } from "@/utils/api";

export default function EditClassGroupPage() {
	const params = useParams();
	const { data: classGroup, isLoading: classGroupLoading } = api.classGroup.getClassGroup.useQuery(params.id as string);
	const { data: programsData, isLoading: programsLoading } = api.program.getAll.useQuery({
		page: 1,
		pageSize: 100
	});

	const isLoading = classGroupLoading || programsLoading;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!classGroup || !programsData) {
		return (
			<div className="p-4 text-center">
				<p className="text-destructive">Failed to load required data.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6">
			<h1 className="text-2xl font-bold mb-6">Edit Class Group</h1>
			<ClassGroupForm 
				programs={programsData.programs.map(p => ({
					id: p.id,
					name: p.name || 'Unnamed Program'
				}))}
				selectedClassGroup={{
					id: classGroup.id,
					name: classGroup.name,
					description: classGroup.description,
					programId: classGroup.programId,
					status: classGroup.status,
					calendarId: classGroup.calendarId
				}}
				onSuccess={() => {
					window.location.href = `/dashboard/super-admin/class-group`;
				}}
			/>
		</div>
	);
}