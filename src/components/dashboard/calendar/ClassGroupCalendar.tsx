import { FC } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from './CalendarView';
import { TimetableView } from '@/components/dashboard/calendar/TimetableView';
import { CalendarEvent } from '@/types/calendar';

type ViewEvent = Omit<CalendarEvent, 'startDate' | 'endDate'> & {
	start: Date;
	end: Date;
	type: 'class' | 'class_group' | 'timetable';
	entityId: string;
};

interface ClassGroupCalendarProps {
	classGroupId: string;
	groupEvents?: ViewEvent[];
	onEventAdd?: (event: ViewEvent) => void;
	onEventEdit?: (event: ViewEvent) => void;
}

export const ClassGroupCalendar: FC<ClassGroupCalendarProps> = ({
	classGroupId,
	groupEvents = [],
	onEventAdd,
	onEventEdit
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Class Group Calendar</CardTitle>
			</CardHeader>

			<Tabs defaultValue="calendar" className="p-4">
				<TabsList>
					<TabsTrigger value="calendar">Calendar</TabsTrigger>
					<TabsTrigger value="timetable">Timetable</TabsTrigger>
				</TabsList>

				<TabsContent value="calendar">
					<CalendarView
						entityType="class_group"
						entityId={classGroupId}
						events={groupEvents}
						onEventAdd={onEventAdd}
						onEventEdit={onEventEdit}
					/>
				</TabsContent>

				<TabsContent value="timetable">
					<TimetableView
						entityType="class_group"
						entityId={classGroupId}
					/>
				</TabsContent>
			</Tabs>
		</Card>
	);
};