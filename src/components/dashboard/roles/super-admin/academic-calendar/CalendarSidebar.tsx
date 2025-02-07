'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarForm } from "./CalendarForm";
import { cn } from "@/lib/utils";

interface CalendarSidebarProps {
	calendars: Calendar[];
	activeCalendarId: string | null;
	onCalendarSelect: (id: string) => void;
	onCalendarUpdate: (id: string, data: Partial<Calendar>) => void;
}

export const CalendarSidebar = ({
	calendars,
	activeCalendarId,
	onCalendarSelect,
	onCalendarUpdate,
}: CalendarSidebarProps) => {
	return (
		<div className="w-64 border-r p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Calendars</h2>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" size="icon">
							<PlusIcon className="h-4 w-4" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Calendar</DialogTitle>
						</DialogHeader>
						<CalendarForm onSubmit={(data) => onCalendarUpdate('new', data)} />
					</DialogContent>
				</Dialog>
			</div>

			<div className="space-y-2">
				{calendars.map((calendar) => (
					<button
						key={calendar.id}
						onClick={() => onCalendarSelect(calendar.id)}
						className={cn(
							"w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
							activeCalendarId === calendar.id
								? "bg-primary text-primary-foreground"
								: "hover:bg-muted"
						)}
					>
						<div className="flex items-center justify-between">
							<span>{calendar.name}</span>
							{calendar.isDefault && (
								<span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
									Default
								</span>
							)}
						</div>
						<div className="text-xs text-muted-foreground">
							{calendar.type} • {calendar.visibility}
						</div>
					</button>
				))}
			</div>

			{calendars.length === 0 && (
				<div className="text-sm text-muted-foreground text-center py-4">
					No calendars found
				</div>
			)}
		</div>
	);
};