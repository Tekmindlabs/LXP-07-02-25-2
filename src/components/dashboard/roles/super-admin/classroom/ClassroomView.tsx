"use client";

import { type FC, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { type RouterOutputs } from "@/trpc/react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Classroom = RouterOutputs["classroom"]["getById"];
type Period = RouterOutputs["classroom"]["getAvailability"][number];

interface ClassroomViewProps {
	classroomId: string;
	onEdit: () => void;
}

const ClassroomView: FC<ClassroomViewProps> = ({ classroomId, onEdit }) => {

	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	
	const { data: classroom, isLoading: classroomLoading } = api.classroom.getById.useQuery(classroomId);
	const { data: availability, isLoading: availabilityLoading } = api.classroom.getAvailability.useQuery({
		classroomId,
		date: selectedDate,
	});

	if (classroomLoading || availabilityLoading) {
		return <div>Loading...</div>;
	}

	if (!classroom) {
		return <div>Classroom not found</div>;
	}

	return (
		<DialogContent className="max-w-4xl">
			<DialogHeader>
				<div className="flex items-center justify-between">
					<DialogTitle className="text-2xl font-bold">{classroom?.name}</DialogTitle>
					<Button onClick={onEdit}>
						Edit Classroom
					</Button>
				</div>
			</DialogHeader>

			<div className="grid gap-4 md:grid-cols-2">

				<Card>
					<CardHeader>
						<CardTitle>Classroom Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p>
								<span className="font-semibold">Capacity:</span> {classroom.capacity}
							</p>
							{classroom.resources && (
								<div>
									<span className="font-semibold">Resources:</span>
									<ul className="list-disc list-inside">
										{(() => {
											try {
												const resources = JSON.parse(classroom.resources);
												return Array.isArray(resources)
													? resources.map((resource: string, index: number) => (
															<li key={index}>{resource}</li>
													))
													: <li>{classroom.resources}</li>;
											} catch (e) {
												return <li>{classroom.resources}</li>;
											}
										})()}
									</ul>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Schedule</CardTitle>
					</CardHeader>
					<CardContent>
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={(date) => date && setSelectedDate(date)}
							className="mb-4"
						/>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>
							Availability for {format(selectedDate, "EEEE, MMMM d, yyyy")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{availability && availability.length > 0 ? (
							<div className="space-y-2">
								{availability.map((period: Period) => (
									<Card key={period.id} className="p-4">
										<div className="flex justify-between items-center">
											<div>
												<p className="font-semibold">
													{format(new Date(period.startTime), "HH:mm")} -{" "}
													{format(new Date(period.endTime), "HH:mm")}
												</p>
												<p>{period.subject.name}</p>
												<p className="text-sm text-muted-foreground">
													{period.timetable.classGroup?.name || period.timetable.class?.name}
												</p>
											</div>
										</div>
									</Card>
								))}
							</div>
						) : (
							<p className="text-muted-foreground">No classes scheduled for this day</p>
						)}
					</CardContent>
				</Card>
			</div>
		</DialogContent>
	);
};

export default ClassroomView;