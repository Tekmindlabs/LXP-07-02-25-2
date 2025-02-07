'use client';

import { useParams } from "next/navigation";
import { ClassDetailsView } from "@/components/dashboard/roles/super-admin/class/ClassDetailsView";

export default function ClassDetailsPage() {
	const params = useParams();
	const classId = params.id as string;

	return (
		<div className="container mx-auto py-6">
			<ClassDetailsView classId={classId} />
		</div>
	);
}