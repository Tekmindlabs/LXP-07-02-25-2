import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GradebookOverviewData } from "./types";

interface GradebookOverviewProps {
	data?: GradebookOverviewData;
}

export const GradebookOverview: React.FC<GradebookOverviewProps> = ({ data }) => {
	if (!data) {
		return <div>No data available</div>;
	}

	const { classAverage, highestGrade, lowestGrade, distribution, totalStudents } = data;

	const getDistributionPercentage = (count: number) => {
		return (count / totalStudents) * 100;
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">{classAverage.toFixed(1)}%</div>
						<div className="text-sm text-muted-foreground">Class Average</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">{highestGrade.toFixed(1)}%</div>
						<div className="text-sm text-muted-foreground">Highest Grade</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">{lowestGrade.toFixed(1)}%</div>
						<div className="text-sm text-muted-foreground">Lowest Grade</div>
					</CardContent>
				</Card>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Grade Distribution</h3>
				<div className="space-y-2">
					{Object.entries(distribution).map(([grade, count]) => (
						<div key={grade} className="space-y-1">
							<div className="flex justify-between text-sm">
								<span>{grade}</span>
								<span>{count} students</span>
							</div>
							<Progress value={getDistributionPercentage(count)} />
						</div>
					))}
				</div>
			</div>
		</div>
	);

};