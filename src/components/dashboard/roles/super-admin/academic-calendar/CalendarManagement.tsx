'use client';

import { useState } from 'react';
import { CalendarType, Priority, Status, Visibility } from '@prisma/client';
import { api } from '@/utils/api';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarContent } from './CalendarContent';
import { useToast } from '@/hooks/use-toast';

interface CalendarFilters {
	type?: CalendarType;
	status?: Status;
	dateRange?: { from: Date; to: Date } | null;
	visibility?: Visibility;
}

export const CalendarManagement = () => {
	const [activeCalendarId, setActiveCalendarId] = useState<string | null>(null);
	const [view, setView] = useState<'list' | 'calendar'>('calendar');
	const [filters, setFilters] = useState<CalendarFilters>({});
	const { toast } = useToast();

	const { data: calendars } = api.academicCalendar.getAllCalendars.useQuery();
	const { data: activeCalendar } = api.academicCalendar.getCalendarById.useQuery(
		{ id: activeCalendarId! },
		{ enabled: !!activeCalendarId }
	);

	const createCalendarMutation = api.academicCalendar.createCalendar.useMutation({
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Calendar created successfully',
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	});

	const updateCalendarMutation = api.academicCalendar.updateCalendar.useMutation({
		onSuccess: () => {
			toast({
				title: 'Success',
				description: 'Calendar updated successfully',
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	});

	const handleCalendarUpdate = async (calendarId: string, data: any) => {
		try {
			if (calendarId === 'new') {
				await createCalendarMutation.mutateAsync(data);
			} else {
				await updateCalendarMutation.mutateAsync({
					id: calendarId,
					...data,
				});
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update calendar',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="flex h-full">
			<CalendarSidebar
				calendars={calendars || []}
				activeCalendarId={activeCalendarId}
				onCalendarSelect={setActiveCalendarId}
				onCalendarUpdate={handleCalendarUpdate}
			/>
			
			<div className="flex-1 space-y-4">
				<CalendarHeader 
					view={view}
					onViewChange={setView}
					filters={filters}
					onFiltersChange={setFilters}
				/>
				
				{activeCalendar && (
					<CalendarContent
						calendar={activeCalendar}
						view={view}
						filters={filters}
					/>
				)}
			</div>
		</div>
	);
};