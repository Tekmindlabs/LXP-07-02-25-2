import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { CalendarEvent } from '@/types/calendar';

type ViewEvent = Omit<CalendarEvent, 'startDate' | 'endDate'> & {
	start: Date;
	end: Date;
	type: 'class' | 'class_group' | 'timetable';
	entityId: string;
};

interface EventFormData {
	title: string;
	start: Date;
	end: Date;
	description?: string;
}

interface EventFormProps {
	event?: ViewEvent;
	entityType: 'class' | 'class_group' | 'timetable';
	entityId: string;
	onSave: (data: EventFormData) => void;
	onClose: () => void;
}

export const EventForm: FC<EventFormProps> = ({
	event,
	entityType,
	entityId,
	onSave,
	onClose
}) => {
	const form = useForm<EventFormData>({
		defaultValues: event ? {
			title: event.title,
			start: event.start,
			end: event.end,
			description: event.description,
		} : {
			title: '',
			start: new Date(),
			end: new Date(),
			description: '',
		}
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					{event ? 'Edit Event' : 'Create Event'}
				</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="start"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Time</FormLabel>
								<FormControl>
									<DateTimePicker
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="end"
						render={({ field }) => (
							<FormItem>
								<FormLabel>End Time</FormLabel>
								<FormControl>
									<DateTimePicker
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					  <FormField
						control={form.control}
						name="description"
						render={({ field }) => (
						  <FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
							  <Input {...field} />
							</FormControl>
						  </FormItem>
						)}
					  />

					  <div className="flex justify-end space-x-2">
						<Button variant="outline" onClick={onClose}>
						  Cancel
						</Button>
						<Button type="submit">
						  {event ? 'Update' : 'Create'}
						</Button>
					  </div>
					</form>
				  </Form>
				</DialogContent>
			  );
			};