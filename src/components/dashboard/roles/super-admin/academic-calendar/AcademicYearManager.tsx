import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { Status } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface CalendarFormData {
	name: string;
	description?: string;
	status: Status;
}

export const CalendarManager = ({ calendars }: { calendars: any[] }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState<CalendarFormData>({
		name: "",
		description: "",
		status: Status.ACTIVE,
	});

	const utils = api.useContext();
	const { toast } = useToast();

	const createMutation = api.academicCalendar.createCalendar.useMutation({
		onSuccess: () => {
			utils.academicCalendar.getAllCalendars.invalidate();
			setIsOpen(false);
			toast({
				title: "Success",
				description: "Calendar created successfully",
			});
			resetForm();
		},
	});

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
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
					<Button>Create Calendar</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Calendar</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</div>
						<div>
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>
						<Button type="submit" disabled={createMutation.isLoading}>
							{createMutation.isLoading ? "Creating..." : "Create Calendar"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{calendars?.map((calendar) => (
					<Card key={calendar.id}>
						<CardContent className="p-4">
							<h3 className="font-semibold">{calendar.name}</h3>
							<p className="text-sm text-gray-500">{calendar.description}</p>
							<div className="mt-4">
								<TermManager calendarId={calendar.id} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};
