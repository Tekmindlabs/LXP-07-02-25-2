import { FC, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimetableView } from './TimetableView';
import { CalendarView } from './CalendarView';
import { CalendarEvent } from '@/types/calendar';

interface TimetableCalendarProps {
	timetableId: string;
	timetableEvents?: CalendarEvent[];
	onEventAdd?: (event: CalendarEvent) => void;
	onEventEdit?: (event: CalendarEvent) => void;
}

export const TimetableCalendar: FC<TimetableCalendarProps> = ({
	timetableId,
	timetableEvents = [],
	onEventAdd,
	onEventEdit
}) => {
	const [viewType, setViewType] = useState<'timetable' | 'calendar'>('timetable');

	return (
		<Card>
			<CardHeader>
				<CardTitle>Timetable Management</CardTitle>
			</CardHeader>

			<div className="p-4 space-y-4">
				<Select value={viewType} onValueChange={(value: 'timetable' | 'calendar') => setViewType(value)}>
					<SelectTrigger>
						<SelectValue placeholder="Select View" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="timetable">Timetable View</SelectItem>
						<SelectItem value="calendar">Calendar View</SelectItem>
					</SelectContent>
				</Select>

				{viewType === 'timetable' ? (
					<TimetableView
						entityType="timetable"
						entityId={timetableId}
					/>
				) : (
					<CalendarView
						entityType="timetable"
						entityId={timetableId}
						events={timetableEvents}
						showPeriods={true}
						onEventAdd={onEventAdd}
						onEventEdit={onEventEdit}
					/>
				)}
			</div>
		</Card>
	);
};