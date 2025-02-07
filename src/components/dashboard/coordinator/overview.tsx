'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
	{ month: 'Jan', attendance: 85, performance: 78, engagement: 72 },
	{ month: 'Feb', attendance: 88, performance: 82, engagement: 75 },
	{ month: 'Mar', attendance: 87, performance: 85, engagement: 80 },
	{ month: 'Apr', attendance: 84, performance: 83, engagement: 78 },
	{ month: 'May', attendance: 90, performance: 88, engagement: 85 },
];

export function Overview() {
	return (
		<div className="h-[400px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="month" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line type="monotone" dataKey="attendance" stroke="#8884d8" name="Attendance %" />
					<Line type="monotone" dataKey="performance" stroke="#82ca9d" name="Performance %" />
					<Line type="monotone" dataKey="engagement" stroke="#ffc658" name="Engagement %" />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}