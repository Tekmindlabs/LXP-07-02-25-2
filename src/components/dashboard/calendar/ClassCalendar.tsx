import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/utils/api";
import { format } from "date-fns";

interface ClassCalendarProps {
	classId: string;
}

export const ClassCalendar: React.FC<ClassCalendarProps> = ({ classId }) => {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const { data: events } = api.calendar.getClassEvents.useQuery({ classId });

	return (
		<div className="space-y-4">
			<Calendar
				mode="single"
				selected={selectedDate}
				onSelect={(date) => date && setSelectedDate(date)}
				className="rounded-md border"
			/>
			<div className="space-y-2">
				{events?.map((event) => (
					<Card key={event.id}>
						<CardHeader>
							<CardTitle>{event.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{event.description}</p>
							<p>Start: {format(new Date(event.startDate), 'PPP')}</p>
							<p>End: {format(new Date(event.endDate), 'PPP')}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>

	);
};