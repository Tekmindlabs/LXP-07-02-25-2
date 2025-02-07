'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const performanceData = [
	{
		name: 'Grade 5A',
		attendance: 92,
		assignments: 85,
		assessments: 78,
	},
	{
		name: 'Grade 5B',
		attendance: 88,
		assignments: 82,
		assessments: 75,
	},
	{
		name: 'Grade 6A',
		attendance: 95,
		assignments: 88,
		assessments: 82,
	},
	{
		name: 'Grade 6B',
		attendance: 90,
		assignments: 85,
		assessments: 80,
	},
];

const metrics = [
	{ label: 'Average Attendance', value: '91%', trend: 'up' },
	{ label: 'Assignment Completion', value: '85%', trend: 'up' },
	{ label: 'Assessment Performance', value: '78%', trend: 'down' },
];

export function PerformanceMetrics() {
	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-3">
				{metrics.map((metric, index) => (
					<Card key={index}>
						<CardContent className="p-4">
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
								<div className="flex items-center justify-between">
									<span className="text-2xl font-bold">{metric.value}</span>
									<Badge variant={metric.trend === 'up' ? 'default' : 'destructive'}>
										{metric.trend === 'up' ? '↑' : '↓'}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<div className="h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Bar dataKey="attendance" fill="#8884d8" name="Attendance %" />
						<Bar dataKey="assignments" fill="#82ca9d" name="Assignments %" />
						<Bar dataKey="assessments" fill="#ffc658" name="Assessments %" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}