'use client';

import { use } from 'react';
import { CalendarView } from '@/components/dashboard/calendar/CalendarView';
import { api } from '@/trpc/react';

interface PageProps {
	params: {
		role: string;
	};
}

export default function CalendarPage({ params }: PageProps) {
	const { role } = use(params as PageProps['params']);
	
	const { data: events = [] } = api.calendar.getEvents.useQuery({
		level: role,
		status: 'ACTIVE'
	});

	return (
		<div className="container mx-auto py-6">
			<CalendarView
				entityType={role as 'class' | 'class_group' | 'timetable'}
				entityId={role}
				events={events}
			/>
		</div>
	);
}
