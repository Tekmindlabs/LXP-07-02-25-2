'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
	{
		id: 1,
		type: 'assignment',
		title: 'New Assignment Added',
		program: 'Elementary School',
		class: 'Grade 5A',
		teacher: 'John Smith',
		time: '2 hours ago',
		avatar: '/avatars/01.png',
	},
	{
		id: 2,
		type: 'grade',
		title: 'Grades Updated',
		program: 'Middle School',
		class: 'Grade 7B',
		teacher: 'Sarah Johnson',
		time: '3 hours ago',
		avatar: '/avatars/02.png',
	},
	{
		id: 3,
		type: 'attendance',
		title: 'Attendance Report',
		program: 'Elementary School',
		class: 'Grade 4C',
		teacher: 'Mike Wilson',
		time: '5 hours ago',
		avatar: '/avatars/03.png',
	},
	// Add more activities as needed
];

export function RecentActivities() {
	return (
		<ScrollArea className="h-[400px] w-full rounded-md border p-4">
			<div className="space-y-8">
				{activities.map((activity) => (
					<div key={activity.id} className="flex items-start space-x-4">
						<Avatar className="h-8 w-8">
							<AvatarImage src={activity.avatar} alt={activity.teacher} />
							<AvatarFallback>{activity.teacher[0]}</AvatarFallback>
						</Avatar>
						<div className="space-y-1">
							<p className="text-sm font-medium">{activity.title}</p>
							<div className="text-sm text-muted-foreground">
								<span className="font-semibold">{activity.program}</span> - {activity.class}
							</div>
							<div className="text-xs text-muted-foreground">
								By {activity.teacher} • {activity.time}
							</div>
						</div>
					</div>
				))}
			</div>
		</ScrollArea>
	);
}