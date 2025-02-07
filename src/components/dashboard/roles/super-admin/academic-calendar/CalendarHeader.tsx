'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarType, Status, Visibility } from "@prisma/client";
import { CalendarIcon, ListIcon } from "lucide-react";
import { format } from "date-fns";

interface CalendarFilters {
	type?: CalendarType;
	status?: Status;
	dateRange?: { from: Date; to: Date } | null;
	visibility?: Visibility;
}

interface CalendarHeaderProps {
	view: 'list' | 'calendar';
	onViewChange: (view: 'list' | 'calendar') => void;
	filters: CalendarFilters;
	onFiltersChange: (filters: CalendarFilters) => void;
}

export const CalendarHeader = ({
	view,
	onViewChange,
	filters,
	onFiltersChange,
}: CalendarHeaderProps) => {
	return (
		<div className="flex items-center justify-between p-4 border-b">
			<div className="flex items-center space-x-4">
				<div className="flex items-center space-x-2">
					<Button
						variant={view === 'calendar' ? 'default' : 'outline'}
						size="sm"
						onClick={() => onViewChange('calendar')}
					>
						<CalendarIcon className="h-4 w-4 mr-2" />
						Calendar
					</Button>
					<Button
						variant={view === 'list' ? 'default' : 'outline'}
						size="sm"
						onClick={() => onViewChange('list')}
					>
						<ListIcon className="h-4 w-4 mr-2" />
						List
					</Button>
				</div>

				<Select
					value={filters.type}
					onValueChange={(value: CalendarType) =>
						onFiltersChange({ ...filters, type: value })
					}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Calendar Type" />
					</SelectTrigger>
					<SelectContent>
						{Object.values(CalendarType).map((type) => (
							<SelectItem key={type} value={type}>
								{type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={filters.visibility}
					onValueChange={(value: Visibility) =>
						onFiltersChange({ ...filters, visibility: value })
					}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Visibility" />
					</SelectTrigger>
					<SelectContent>
						{Object.values(Visibility).map((visibility) => (
							<SelectItem key={visibility} value={visibility}>
								{visibility}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm">
							<CalendarIcon className="h-4 w-4 mr-2" />
							{filters.dateRange?.from ? (
								filters.dateRange.to ? (
									<>
										{format(filters.dateRange.from, "LLL dd, y")} -{" "}
										{format(filters.dateRange.to, "LLL dd, y")}
									</>
								) : (
									format(filters.dateRange.from, "LLL dd, y")
								)
							) : (
								<span>Date Range</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="range"
							selected={filters.dateRange || undefined}
							onSelect={(range) =>
								onFiltersChange({ ...filters, dateRange: range })
							}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			<Button
				onClick={() =>
					onFiltersChange({
						type: undefined,
						status: undefined,
						dateRange: null,
						visibility: undefined,
					})
				}
				variant="ghost"
				size="sm"
			>
				Reset Filters
			</Button>
		</div>
	);
};