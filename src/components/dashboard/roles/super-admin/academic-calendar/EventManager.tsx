import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { EventType, Status } from "@prisma/client";
import { format } from "date-fns";


interface EventFormData {
	title: string;
	description?: string;
	eventType: EventType;
	startDate: Date;
	endDate: Date;
	status: Status;
}

interface EventManagerProps {
	filteredEvents: any[];
}

export const EventManager = ({ filteredEvents }: EventManagerProps) => {

	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState<EventFormData>({
		title: "",
		description: "",
		eventType: EventType.ACADEMIC,
		startDate: new Date(),
		endDate: new Date(),
		status: Status.ACTIVE,
	});

	const utils = api.useContext();
	const { toast } = useToast();

	const createMutation = api.academicCalendar.createEvent.useMutation({
		onSuccess: () => {
			utils.academicCalendar.getEventsByDateRange.invalidate();
			setIsOpen(false);
			toast({
				title: "Success",
				description: "Event created successfully",
			});
			resetForm();
		},
	});


	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			eventType: EventType.ACADEMIC,
			startDate: new Date(),
			endDate: new Date(),
			status: Status.ACTIVE,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createMutation.mutate(formData);
	};


	return (
		<div>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button>Add Event</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Event</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
							/>
						</div>
						<div>
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>
						<div>
							<Label htmlFor="eventType">Event Type</Label>
							<Select
								value={formData.eventType}
								onValueChange={(value) => setFormData({ ...formData, eventType: value as EventType })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select event type" />
								</SelectTrigger>
								<SelectContent>
									{Object.values(EventType).map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="startDate">Start Date</Label>
							<Input
								id="startDate"
								type="date"
								value={format(formData.startDate, 'yyyy-MM-dd')}
								onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
								required
							/>
						</div>
						<div>
							<Label htmlFor="endDate">End Date</Label>
							<Input
								id="endDate"
								type="date"
								value={format(formData.endDate, 'yyyy-MM-dd')}
								onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
								required
							/>
						</div>
						<Button type="submit" disabled={createMutation.isLoading}>
							{createMutation.isLoading ? "Creating..." : "Create Event"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			<div className="mt-4 space-y-4">
				{filteredEvents.map((event) => (
					<Card key={event.id}>
						<CardHeader>
							<CardTitle>{event.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{event.description}</p>
							<p>Type: {event.eventType}</p>
							<p>
								{format(new Date(event.startDate), 'PPP')} -{' '}
								{format(new Date(event.endDate), 'PPP')}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);

};