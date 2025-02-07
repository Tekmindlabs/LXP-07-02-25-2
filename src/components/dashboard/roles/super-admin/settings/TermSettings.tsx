"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Status } from "@prisma/client";
import { format } from "date-fns";

export const TermSettings = ({ calendarId }: { calendarId: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [term, setTerm] = useState({
		name: "",
		startDate: "",
		endDate: "",
	});

	const { toast } = useToast();
	const utils = api.useContext();

	const { data: terms } = api.term.getByCalendar.useQuery(calendarId);

	const createTerm = api.term.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Term created successfully",
			});
			setIsOpen(false);
			utils.term.getByCalendar.invalidate(calendarId);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const deleteTerm = api.term.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Term deleted successfully",
			});
			utils.term.getByCalendar.invalidate(calendarId);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createTerm.mutate({
			...term,
			calendarId,
			startDate: new Date(term.startDate),
			endDate: new Date(term.endDate),
			status: Status.ACTIVE,
		});
	};

	return (
		<Card className="mt-6">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Terms</CardTitle>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button>Add Term</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Term</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label>Name</Label>
								<Input
									value={term.name}
									onChange={(e) => setTerm({ ...term, name: e.target.value })}
									placeholder="e.g., Fall Term"
								/>
							</div>
							<div className="space-y-2">
								<Label>Start Date</Label>
								<Input
									type="date"
									value={term.startDate}
									onChange={(e) => setTerm({ ...term, startDate: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>End Date</Label>
								<Input
									type="date"
									value={term.endDate}
									onChange={(e) => setTerm({ ...term, endDate: e.target.value })}
								/>
							</div>
							<Button type="submit" disabled={createTerm.isPending}>
								{createTerm.isPending ? "Creating..." : "Create Term"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{terms?.map((term) => (
						<div
							key={term.id}
							className="flex items-center justify-between rounded-lg border p-4"
						>
							<div>
								<h4 className="font-medium">{term.name}</h4>
								<p className="text-sm text-gray-500">
									{format(new Date(term.startDate), "PPP")} -{" "}
									{format(new Date(term.endDate), "PPP")}
								</p>
							</div>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => deleteTerm.mutate(term.id)}
								disabled={deleteTerm.isPending}
							>
								Delete
							</Button>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};