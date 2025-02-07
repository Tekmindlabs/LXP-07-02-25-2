'use client'

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimetableForm from "./TimetableForm";
import TimetableView from "./TimetableView";

export default function TimetableManagement() {
	const [isCreating, setIsCreating] = useState(false);
	const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);

	const { data: timetables, isLoading } = api.timetable.getAll.useQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>Timetable Management</span>
						<Button onClick={() => setIsCreating(true)} disabled={isCreating}>
							Create New Timetable
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isCreating ? (
						<TimetableForm onCancel={() => setIsCreating(false)} />
					) : selectedTimetableId ? (
						<TimetableView 
							timetableId={selectedTimetableId} 
							onBack={() => setSelectedTimetableId(null)} 
						/>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{timetables?.map((timetable) => (
								<Card 
									key={timetable.id} 
									className="cursor-pointer hover:bg-accent"
									onClick={() => setSelectedTimetableId(timetable.id)}
								>
									<CardContent className="p-4">
										<h3 className="font-semibold">
											{timetable.classGroup?.name || timetable.class?.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											{timetable.periods.length} Periods
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}