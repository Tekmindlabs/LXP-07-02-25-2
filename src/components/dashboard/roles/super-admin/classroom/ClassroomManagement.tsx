"use client";

import { type FC, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import ClassroomForm from "./ClassroomForm";
import ClassroomView from "./ClassroomView";
import { type RouterOutputs } from "@/utils/api";

type Classroom = RouterOutputs["classroom"]["getAll"][number];

const ClassroomManagement: FC = () => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
	const [viewClassroomId, setViewClassroomId] = useState<string | null>(null);

	const { data: classrooms, isLoading } = api.classroom.getAll.useQuery();

	const handleEdit = (id: string) => {
		setSelectedClassroomId(id);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setSelectedClassroomId(null);
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setSelectedClassroomId(null);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Classroom Management</CardTitle>
						<Button onClick={handleCreate}>
							Create New Classroom
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{classrooms?.map((classroom: Classroom) => (
							<Card 
								key={classroom.id} 
								className="cursor-pointer hover:bg-accent"
								onClick={() => setViewClassroomId(classroom.id)}
							>
								<CardContent className="p-4">
									<div className="flex justify-between items-start">
										<div>
											<h3 className="font-semibold">{classroom.name}</h3>
											<p className="text-sm text-muted-foreground">
												Capacity: {classroom.capacity}
											</p>
											{classroom.resources && (
												<p className="text-sm text-muted-foreground">
													Resources: {
														(() => {
															try {
																const parsedResources = JSON.parse(classroom.resources);
																return Array.isArray(parsedResources) ? parsedResources.join(", ") : classroom.resources;
															} catch (e) {
																return classroom.resources;
															}
														})()
													}
												</p>
											)}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(classroom.id);
											}}
										>
											Edit
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			<ClassroomForm 
				isOpen={isFormOpen}
				onClose={handleCloseForm}
				classroomId={selectedClassroomId}
			/>

			{viewClassroomId && (
				<Dialog open={!!viewClassroomId} onOpenChange={() => setViewClassroomId(null)}>
					<ClassroomView 
						classroomId={viewClassroomId}
						onEdit={() => {
							setViewClassroomId(null);
							handleEdit(viewClassroomId);
						}}
					/>
				</Dialog>
			)}
		</div>
	);
};

export default ClassroomManagement;