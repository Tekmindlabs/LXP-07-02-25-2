'use client';

import { useParams } from 'next/navigation';
import { ClassGroupDetailsView } from "@/components/dashboard/roles/super-admin/class-group/ClassGroupDetailsView";

export default function ViewClassGroupPage() {
	const params = useParams();

	return (
		<div className="container mx-auto py-6">
			<ClassGroupDetailsView classGroupId={params.id as string} />
		</div>
	);
}
