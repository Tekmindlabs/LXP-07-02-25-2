'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";

interface Coordinator {
	id: string;
	name: string;
	email: string;
	status: Status;
	coordinatorProfile: {
		programs: {
			id: string;
			name: string;
		}[];
	};
}


interface CoordinatorListProps {
	coordinators: Coordinator[];
	onSelect: (id: string) => void;
}

export const CoordinatorList = ({ coordinators, onSelect }: CoordinatorListProps) => {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Programs</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{coordinators.map((coordinator) => (
						<TableRow key={coordinator.id}>
							<TableCell>{coordinator.name}</TableCell>
							<TableCell>{coordinator.email}</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-2">
									{coordinator.coordinatorProfile?.programs.map((program) => (
										<Badge key={program.id} variant="secondary">
											{program.name}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell>
								<Badge variant={coordinator.status === "ACTIVE" ? "success" : "secondary"}>
									{coordinator.status}
								</Badge>
							</TableCell>
							<TableCell>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onSelect(coordinator.id)}
								>
									View Details
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};