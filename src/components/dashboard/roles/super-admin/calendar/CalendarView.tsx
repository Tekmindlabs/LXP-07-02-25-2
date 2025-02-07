'use client';

import { useState, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { addMonths, isSameMonth, isWithinInterval, format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { EventType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { EventForm } from "../academic-calendar/EventForm";



const CalendarView = () => {
	const { toast } = useToast();
	const [isAddEventOpen, setIsAddEventOpen] = useState(false);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const role = pathname.split('/')[2];
	const calendarId = searchParams.get('calendarId');

	// Add event mutation
	const createEvent = api.academicCalendar.createEvent.useMutation({
		onSuccess: () => {
			toast({ title: "Success", description: "Event created successfully" });
			setIsAddEventOpen(false);
		},
		onError: (error) => {
			toast({ title: "Error", description: error.message, variant: "destructive" });
		},
	});

	// Fetch calendar details
	const { data: calendar } = api.academicCalendar.getCalendarById.useQuery(
		{ id: calendarId || '' },
		{ enabled: !!calendarId }
	);

	const startDate = useMemo(() => calendar ? new Date(calendar.startDate) : new Date(), [calendar?.startDate]);
	const endDate = useMemo(() => calendar ? new Date(calendar.endDate) : new Date(), [calendar?.endDate]);
	const [selectedDate, setSelectedDate] = useState<Date>(startDate);
	const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(startDate));

	// Fetch events based on date range
	const { data: events } = api.academicCalendar.getEventsByDateRange.useQuery({
		calendarId: calendarId || '',
		startDate: startOfMonth(currentMonth),
		endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
	}, {
		enabled: !!calendarId,
	});

	const getEventsForDate = (date: Date) => {
		if (!events) return [];
		return events.filter(event => {
			const eventStart = new Date(event.startDate);
			const eventEnd = new Date(event.endDate);
			return isWithinInterval(date, { start: eventStart, end: eventEnd });
		});
	};

	const getDateClassName = (date: Date, isCurrentMonth: boolean): string => {
		if (!isCurrentMonth) return 'text-gray-400';
		const dayEvents = getEventsForDate(date);
		if (dayEvents.length === 0) return '';
		const eventTypes = dayEvents.map(e => e.eventType);
		if (eventTypes.includes(EventType.HOLIDAY)) return 'bg-red-200 text-red-800 hover:bg-red-300';
		if (eventTypes.includes(EventType.EXAM)) return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
		return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
	};

	const getDaysInMonth = (date: Date) => {
		const start = startOfMonth(date);
		const days = [];
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const startDay = start.getDay();

		for (let i = 0; i < startDay; i++) {
			const prevDate = new Date(date.getFullYear(), date.getMonth(), -i);
			days.unshift(prevDate);
		}

		for (let i = 1; i <= daysInMonth; i++) {
			days.push(new Date(date.getFullYear(), date.getMonth(), i));
		}

		const remainingDays = 42 - days.length;
		for (let i = 1; i <= remainingDays; i++) {
			days.push(new Date(date.getFullYear(), date.getMonth() + 1, i));
		}

		return days;
	};

	return (
		<div className="w-full">
			<Card className="p-4">
				<TooltipProvider>
					<div className="space-y-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">
								{calendar?.name} - {format(currentMonth, 'MMMM yyyy')}
							</h2>
							<div className="flex items-center space-x-4">
								<Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
									<DialogTrigger asChild>
										<Button>
											<Plus className="h-4 w-4 mr-2" />
											Add Event
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Add New Event</DialogTitle>
										</DialogHeader>
										<EventForm 
											calendarId={calendarId || ''}
											onSubmit={(data) => {
												if (!data.title || !data.eventType || !data.startDate || !data.endDate) return;
												createEvent.mutate({
													title: data.title,
													description: data.description ?? undefined,
													eventType: data.eventType,
													startDate: data.startDate,
													endDate: data.endDate,
													status: 'ACTIVE',
													calendarId: calendarId || ''
												});
											}}
										/>
									</DialogContent>
								</Dialog>
								<div className="space-x-2">
									<button
										onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
										disabled={isSameMonth(currentMonth, startDate)}
										className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
									>
										<ChevronLeft className="h-4 w-4" />
									</button>
									<button
										onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
										disabled={isSameMonth(currentMonth, endDate)}
										className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
									>
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-7 gap-1">
							{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
								<div key={day} className="text-center font-medium text-gray-500 py-2">
									{day}
								</div>
							))}
							
							{getDaysInMonth(currentMonth).map((date, index) => {
								const isCurrentMonth = isSameMonth(date, currentMonth);
								const events = getEventsForDate(date);
								
								return (
									<Tooltip key={index}>
										<TooltipTrigger asChild>
											<button
												onClick={() => setSelectedDate(date)}
												className={`
													w-full aspect-square flex items-center justify-center rounded-lg
													${getDateClassName(date, isCurrentMonth)}
													${date.toDateString() === selectedDate?.toDateString() ? 'ring-2 ring-primary' : ''}
												`}
											>
												{date.getDate()}
											</button>
										</TooltipTrigger>
										{events.length > 0 && (
											<TooltipContent>
												<div className="space-y-1">
													{events.map((event, idx) => (
														<div key={idx} className="text-sm">
															<span className="font-medium">{event.title}</span>
															<span className="ml-2 text-xs px-1 rounded bg-gray-200">
																{event.eventType}
															</span>
														</div>
													))}
												</div>
											</TooltipContent>
										)}
									</Tooltip>
								);
							})}
						</div>

						{selectedDate && (
							<>
								<h3 className="text-lg font-medium">Events on {format(selectedDate, 'MMMM d, yyyy')}</h3>
								<ScrollArea className="h-[300px] w-full rounded-md border p-4">
									<div className="space-y-4">
										{getEventsForDate(selectedDate).map((event, index) => (
											<div
												key={index}
												className={`p-4 rounded-lg ${
													event.eventType === EventType.HOLIDAY ? 'bg-red-100' :
													event.eventType === EventType.EXAM ? 'bg-yellow-100' :
													'bg-blue-100'
												}`}
											>
												<h4 className="font-semibold">{event.title}</h4>
												<p className="text-sm text-gray-600 mt-1">{event.description}</p>
												<div className="flex items-center justify-between mt-2">
													<Badge variant="outline">{event.eventType}</Badge>
													<div className="flex items-center text-sm text-gray-500">
														<CalendarIcon className="mr-2 h-4 w-4" />
														<span>
															{format(new Date(event.startDate), 'MMM d, yyyy')} - 
															{format(new Date(event.endDate), 'MMM d, yyyy')}
														</span>
													</div>
												</div>
											</div>
										))}
										{getEventsForDate(selectedDate).length === 0 && (
											<p className="text-gray-500">No events scheduled for this date</p>
										)}
									</div>
								</ScrollArea>
							</>
						)}
					</div>
				</TooltipProvider>
			</Card>
		</div>
	);
};

export default CalendarView;
