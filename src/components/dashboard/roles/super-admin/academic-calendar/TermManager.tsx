import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/utils/api";
import { Status } from "@prisma/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

interface TermFormData {
	name: string;
	calendarId: string;
	startDate: Date;
	endDate: Date;
	status: Status;
}

export const TermManager = ({ calendarId }: { calendarId: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState<TermFormData>({
		name: "",
		calendarId,
		startDate: new Date(),
		endDate: new Date(),
		status: Status.ACTIVE,
	});

	const utils = api.useContext();
	const { toast } = useToast();
	const { data: terms } = api.term.getTermsByCalendar.useQuery(calendarId);

	const createMutation = api.term.createTerm.useMutation({
		onSuccess: () => {
			utils.term.getTermsByCalendar.invalidate(calendarId);
			setIsOpen(false);
			toast({
				title: "Success",
				description: "Term created successfully",
			});
			resetForm();
		},
	});

	const deleteMutation = api.term.deleteTerm.useMutation({
		onSuccess: () => {
			utils.term.getTermsByAcademicYear.invalidate(academicYearId);
		},
	});

	const resetForm = () => {
		setFormData({
			name: "",
			calendarId,
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
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Terms</h3>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button>Add Term</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Term</DialogTitle>
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
								<Label>Start Date</Label>
								<Calendar
									mode="single"
									selected={formData.startDate}
									onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
									className="rounded-md border"
								/>
							</div>
							<div>
								<Label>End Date</Label>
								<Calendar
									mode="single"
									selected={formData.endDate}
									onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
									className="rounded-md border"
								/>
							</div>
							<div>
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{Object.values(Status).map((status) => (
											<SelectItem key={status} value={status}>
												{status}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button type="submit">Create Term</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{terms?.map((term) => (
					<Card key={term.id}>
						<CardContent className="p-4">
							<div className="space-y-2">
								<h3 className="font-semibold">{term.name}</h3>
								<p className="text-sm text-gray-500">
									{format(new Date(term.startDate), "MMM dd, yyyy")} -{" "}
									{format(new Date(term.endDate), "MMM dd, yyyy")}
								</p>
								<p className="text-sm">Status: {term.status}</p>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => deleteMutation.mutate(term.id)}
								>
									Delete
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};