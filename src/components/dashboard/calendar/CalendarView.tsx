import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { EventForm } from './EventForm';
import { CalendarEvent } from '@/types/calendar';

interface ViewEvent extends Omit<CalendarEvent, 'startDate' | 'endDate'> {
	start: Date;
	end: Date;
	type: 'class' | 'class_group' | 'timetable';
	entityId: string;
}

interface CalendarViewProps {
	entityType: 'class' | 'class_group' | 'timetable';
	entityId: string;
	events?: ViewEvent[];
	inheritedEvents?: ViewEvent[];
	showPeriods?: boolean;
	onEventAdd?: (event: ViewEvent) => void;
	onEventEdit?: (event: ViewEvent) => void;
}

export const CalendarView: FC<CalendarViewProps> = ({
	entityType,
	entityId,
	events = [],
	inheritedEvents = [],
	showPeriods,
	onEventAdd,
	onEventEdit
}) => {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
	const [showEventDialog, setShowEventDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<ViewEvent | undefined>();

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
		if (onEventAdd) {
			setShowEventDialog(true);
			setSelectedEvent(undefined);
		}
	};


	return (
		<Card className="p-4">
			<div className="flex justify-between items-center mb-4">
				<Select value={calendarView} onValueChange={(v: 'day' | 'week' | 'month') => setCalendarView(v)}>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="View" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="day">Day</SelectItem>
						<SelectItem value="week">Week</SelectItem>
						<SelectItem value="month">Month</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Calendar
				mode="single"
				selected={selectedDate}
				onSelect={(date: Date | undefined) => date && handleDateSelect(date)}
				className="rounded-md border"
				required={false}
			/>

			{showEventDialog && (
				<Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
					<EventForm
						event={selectedEvent}
						entityType={entityType}
						entityId={entityId}
						onSave={(data) => {
						  const newEvent = {
							...data,
							id: crypto.randomUUID(),
							type: entityType,
							entityId,
							start: data.start,
							end: data.end,
						  };
						  if (selectedEvent && onEventEdit) {
							onEventEdit(newEvent as ViewEvent);
						  } else if (onEventAdd) {
							onEventAdd(newEvent as ViewEvent);
						  }
						}}
						onClose={() => setShowEventDialog(false)}
					/>
				</Dialog>
			)}
		</Card>
	);
};