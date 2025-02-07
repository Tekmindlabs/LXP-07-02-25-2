'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import Link from "next/link";

interface CoordinatorDetailsProps {
	coordinatorId: string;
	onBack: () => void;
}

export const CoordinatorDetails = ({ coordinatorId, onBack }: CoordinatorDetailsProps) => {
	const { data: coordinator, isLoading } = api.coordinator.getCoordinator.useQuery(coordinatorId);

	if (isLoading) return <div>Loading...</div>;
	if (!coordinator) return <div>Coordinator not found</div>;

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Button onClick={onBack} variant="outline">Back to List</Button>
				<Link href="/dashboard/coordinator/assignments">
					<Button variant="default">Manage Program Assignments</Button>
				</Link>
			</div>
			
			<Card>
				<CardHeader>
					<CardTitle>Coordinator Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h3 className="font-semibold">Name</h3>
						<p>{coordinator.name}</p>
					</div>
					
					<div>
						<h3 className="font-semibold">Email</h3>
						<p>{coordinator.email}</p>
					</div>

					<div>
						<h3 className="font-semibold">Status</h3>
						<Badge variant={coordinator.status === "ACTIVE" ? "default" : "outline"}>
							{coordinator.status}
						</Badge>
					</div>

					<div>
						<h3 className="font-semibold">Assigned Programs</h3>
						<div className="flex flex-wrap gap-2 mt-2">
							{coordinator.coordinatorProfile?.programs.map((program) => (
								<Badge key={program.id} variant="outline">
									{program.name}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
