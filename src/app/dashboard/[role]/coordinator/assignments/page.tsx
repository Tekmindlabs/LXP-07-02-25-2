import { ProgramAssignment } from '@/components/dashboard/coordinator/program-assignment';

export default function CoordinatorAssignmentsPage() {
	return (
		<div className="container mx-auto py-6">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Program Coordinator Assignments</h1>
				</div>
				<ProgramAssignment />
			</div>
		</div>
	);
}