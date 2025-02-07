import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimetablePeriod } from '@/types/calendar';

interface TimetableViewProps {
	entityType: 'class' | 'class_group' | 'timetable';
	entityId: string;
	periods?: TimetablePeriod[];
}

const timeSlots = [
	'09:00', '10:00', '11:00', '12:00', '13:00',
	'14:00', '15:00', '16:00', '17:00'
];

const weekDays = [
	'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
] as const;

export const TimetableView: FC<TimetableViewProps> = ({
	entityType,
	entityId,
	periods = []
}) => {
	return (
		<Card className="p-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Time</TableHead>
						{weekDays.map(day => (
							<TableHead key={day}>{day}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{timeSlots.map(time => (
						<TableRow key={time}>
							<TableCell>{time}</TableCell>
							{weekDays.map(day => (
								<TableCell key={`${day}-${time}`} className="h-20">
									{periods.filter(period => 
										period.dayOfWeek === day && 
										period.startTime === time
									).map(period => (
										<div key={period.id} className="p-2 bg-secondary rounded">
											<p className="font-medium">{period.subject}</p>
											{period.teacher && <p className="text-sm">{period.teacher}</p>}
											{period.room && <p className="text-sm text-muted-foreground">{period.room}</p>}
										</div>
									))}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Card>
	);
};