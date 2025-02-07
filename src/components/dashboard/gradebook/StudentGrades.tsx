import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StudentGrade } from "./types";

interface StudentGradesProps {
	grades?: StudentGrade[];
}


export const StudentGrades: React.FC<StudentGradesProps> = ({ grades }) => {
	if (!grades?.length) {
		return <div>No student grades available</div>;
	}

	const getGradeColor = (percentage: number) => {
		if (percentage >= 90) return "text-green-600";
		if (percentage >= 80) return "text-blue-600";
		if (percentage >= 70) return "text-yellow-600";
		if (percentage >= 60) return "text-orange-600";
		return "text-red-600";
	};

	return (
		<div className="space-y-6">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Student</TableHead>
						<TableHead>Overall Grade</TableHead>
						<TableHead>Progress</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{grades.map((student) => (
						<TableRow key={student.studentId}>
							<TableCell>{student.studentName}</TableCell>
							<TableCell>
								<span className={getGradeColor(student.overallGrade)}>
									{student.overallGrade.toFixed(1)}%
								</span>
							</TableCell>
							<TableCell className="w-[200px]">
								<Progress value={student.overallGrade} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{grades.map((student) => (
					<Card key={student.studentId}>
						<CardContent className="pt-6">
							<h3 className="text-lg font-medium mb-4">{student.studentName}</h3>
							<div className="space-y-2">
								{student.activityGrades.map((activity) => (
									<div key={activity.activityId} className="flex justify-between items-center">
										<span className="text-sm">{activity.activityName}</span>
										<span className={`text-sm ${getGradeColor((activity.grade / activity.totalPoints) * 100)}`}>
											{activity.grade}/{activity.totalPoints}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};