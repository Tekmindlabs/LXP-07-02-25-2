'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { api } from "@/utils/api";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	programIds: z.array(z.string()).min(1, "At least one program must be selected"),
	responsibilities: z.array(z.string()).min(1, "At least one responsibility is required"),
	status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]),
});

type FormValues = z.infer<typeof formSchema>;

interface CoordinatorFormProps {
	selectedCoordinator?: {
		id: string;
		name: string;
		email: string;
		status: Status;
		coordinatorProfile: {
			programs: { id: string }[];
		};
	};
	programs: { id: string; name: string; level: string }[];
	onSuccess: () => void;
}

export const CoordinatorForm = ({ selectedCoordinator, programs, onSuccess }: CoordinatorFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const defaultResponsibilities = [
		{ value: "managing_terms", label: "Managing Terms" },
		{ value: "coordinating_teachers", label: "Coordinating Teachers" },
		{ value: "program_planning", label: "Program Planning" },
		{ value: "assessment_management", label: "Assessment Management" },
		{ value: "student_support", label: "Student Support" }
	];
	const utils = api.useContext();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedCoordinator?.name || "",
			email: selectedCoordinator?.email || "",
			programIds: selectedCoordinator?.coordinatorProfile.programs.map(p => p.id) || [],
			responsibilities: [],
			status: selectedCoordinator?.status || Status.ACTIVE,
		},
	});

	const createCoordinator = api.coordinator.createCoordinator.useMutation({
		onSuccess: () => {
			utils.coordinator.searchCoordinators.invalidate();
			form.reset();
			onSuccess();
		},
	});

	const updateCoordinator = api.coordinator.updateCoordinator.useMutation({
		onSuccess: () => {
			utils.coordinator.searchCoordinators.invalidate();
			onSuccess();
		},
	});

	const onSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		try {
			if (selectedCoordinator) {
				await updateCoordinator.mutateAsync({
					id: selectedCoordinator.id,
					...values,
				});
			} else {
				await createCoordinator.mutateAsync(values);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} type="email" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="programIds"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Programs</FormLabel>
							<FormControl>
								<MultiSelect
									value={field.value}
									onChange={field.onChange}
									options={programs.map(program => ({
										label: `${program.name} (${program.level})`,
										value: program.id
									}))}
									placeholder="Select programs"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>


				<FormField
					control={form.control}
					name="responsibilities"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Responsibilities</FormLabel>
							<FormControl>
								<MultiSelect
									value={field.value}
									onChange={field.onChange}
									options={defaultResponsibilities}
									placeholder="Select responsibilities"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>


				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{Object.values(Status).map((status) => (
										<SelectItem key={status} value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting}>
					{selectedCoordinator ? "Update" : "Create"} Coordinator
				</Button>
			</form>
		</Form>
	);
};