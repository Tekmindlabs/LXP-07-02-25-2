import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';

const eventSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	startDate: z.date(),
	endDate: z.date(),
	level: z.enum(['CALENDAR', 'PROGRAM', 'CLASS_GROUP', 'CLASS']),
	entityId: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	level: string;
	entityId: string | null;
}

export const EventDialog = ({ open, onOpenChange, level, entityId }: EventDialogProps) => {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      level: level as any,
      entityId: entityId || undefined,
    },
  });

  const createEvent = api.calendar.createEvent.useMutation();

  const onSubmit = async (data: EventFormData) => {
    await createEvent.mutateAsync(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};