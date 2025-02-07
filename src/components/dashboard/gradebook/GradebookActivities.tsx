import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api } from "@/utils/api";
import type { Activity } from "./types";

interface GradebookActivitiesProps {
	activities?: Activity[];
}

export const GradebookActivities: React.FC<GradebookActivitiesProps> = ({ activities }) => {
	const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
	
	const utils = api.useContext();
	const gradeMutation = api.gradebook.gradeActivity.useMutation({
		onSuccess: () => {
			utils.gradebook.getGradebook.invalidate();
		}
	});

	const handleGradeChange = (activityId: string, studentId: string, grade: string) => {
		setGrades(prev => ({
			...prev,
			[activityId]: {
				...prev[activityId],
				[studentId]: Number(grade)
			}
		}));
	};

	const handleSaveGrade = async (activityId: string, studentId: string) => {
		const grade = grades[activityId]?.[studentId];
		if (grade !== undefined) {
			await gradeMutation.mutate({
				activityId,
				studentId,
				grade
			});
		}
	};

	if (!activities?.length) {
		return <div>No activities available</div>;
	}

	return (
		<div className="space-y-6">
			{activities.map((activity) => (
				<div key={activity.id} className="space-y-4">
					<h3 className="text-lg font-medium">{activity.title}</h3>
					<div className="text-sm text-muted-foreground">
						Due: {activity.deadline ? new Date(activity.deadline).toLocaleDateString() : 'No deadline'}
					</div>
					
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Grade</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{activity.submissions.map((submission) => (
								<TableRow key={submission.studentId}>
									<TableCell>{submission.studentName}</TableCell>
									<TableCell>
										{submission.submitted ? "Submitted" : "Not Submitted"}
									</TableCell>
									<TableCell>
										<Input
											type="number"
											value={grades[activity.id]?.[submission.studentId] ?? submission.grade ?? ""}
											onChange={(e) => handleGradeChange(activity.id, submission.studentId, e.target.value)}
											className="w-20"
											min={0}
											max={100}
										/>
									</TableCell>
									<TableCell>
										<Button
											onClick={() => handleSaveGrade(activity.id, submission.studentId)}
											size="sm"
										>
											Save
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			))}
		</div>
	);

};