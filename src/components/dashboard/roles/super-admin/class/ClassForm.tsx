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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/utils/api";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	classGroupId: z.string().min(1, "Class Group is required"),
	capacity: z.number().min(1, "Capacity must be at least 1"),
	status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]),
	classTutorId: z.string().optional(),
	teacherIds: z.array(z.string()).optional(),
	description: z.string().optional(),
	academicYear: z.string().optional(),
	semester: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClassFormProps {
	isOpen: boolean;
	onClose: () => void;
	selectedClass?: {
		id: string;
		name: string;
		capacity: number;
		status: Status;
		classGroup: { id: string };
		teachers: { teacher: { id: string } }[];
	};
	classGroups: { id: string; name: string }[];
	teachers: { id: string; user: { name: string } }[];
}

export const ClassForm = ({ isOpen, onClose, selectedClass, classGroups, teachers }: ClassFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const utils = api.useContext();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedClass?.name || "",
			classGroupId: selectedClass?.classGroup.id || "",
			capacity: selectedClass?.capacity || 30,
			status: selectedClass?.status || Status.ACTIVE,
			teacherIds: selectedClass?.teachers.map(t => t.teacher.id) || [],
			classTutorId: selectedClass?.classTutorId || "NO_CLASS_TUTOR",
		},
	});

	const createClass = api.class.createClass.useMutation({
		onSuccess: () => {
			utils.class.searchClasses.invalidate();
			form.reset();
			onClose();
			toast({
				title: "Success",
				description: "Class created successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateClass = api.class.updateClass.useMutation({
		onSuccess: () => {
			utils.class.searchClasses.invalidate();
			onClose();
			toast({
				title: "Success",
				description: "Class updated successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		try {
			if (selectedClass) {
				await updateClass.mutateAsync({
					id: selectedClass.id,
					...values,
				});
			} else {
				await createClass.mutateAsync(values);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
		  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
			<DialogHeader>
			  <DialogTitle>{selectedClass ? "Edit" : "Create"} Class</DialogTitle>
			</DialogHeader>
			<Form {...form}>
			  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<Tabs defaultValue="basic" className="w-full">
				  <TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="basic">Basic Information</TabsTrigger>
					<TabsTrigger value="teachers">Teachers</TabsTrigger>
					<TabsTrigger value="additional">Additional Details</TabsTrigger>
				  </TabsList>

				  <TabsContent value="basic" className="space-y-4">
				<FormField
				  control={form.control}
				  name="name"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Class Name</FormLabel>
					  <FormControl>
						<Input {...field} />
					  </FormControl>
					  <FormMessage />
					</FormItem>
				  )}
				/>

				<div className="grid grid-cols-2 gap-4">
				  <FormField
					control={form.control}
					name="classGroupId"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Class Group</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
						  <FormControl>
							<SelectTrigger>
							  <SelectValue placeholder="Select a class group" />
							</SelectTrigger>
						  </FormControl>
						  <SelectContent>
							{classGroups.map((group) => (
							  <SelectItem key={group.id} value={group.id}>
								{group.name}
							  </SelectItem>
							))}
						  </SelectContent>
						</Select>
						<FormMessage />
					  </FormItem>
					)}
				  />

				  <FormField
					control={form.control}
					name="capacity"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Capacity</FormLabel>
						<FormControl>
						  <Input 
							type="number" 
							{...field} 
							onChange={e => field.onChange(parseInt(e.target.value))}
						  />
						</FormControl>
						<FormMessage />
					  </FormItem>
					)}
				  />
				</div>

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
			  </TabsContent>

			  <TabsContent value="teachers" className="space-y-4">
				<FormField
				  control={form.control}
				  name="classTutorId"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Class Tutor</FormLabel>
					  <Select onValueChange={field.onChange} value={field.value || "NO_CLASS_TUTOR"}>
						<FormControl>
						  <SelectTrigger>
							<SelectValue placeholder="Select class tutor" />
						  </SelectTrigger>
						</FormControl>
						<SelectContent>
						  <SelectItem value="NO_CLASS_TUTOR">None</SelectItem>
						  {teachers.map((teacher) => (
							<SelectItem key={teacher.id} value={teacher.id}>
							  {teacher.user.name}
							</SelectItem>
						  ))}
						</SelectContent>
					  </Select>
					  <FormMessage />
					</FormItem>
				  )}
				/>

				<FormField
				  control={form.control}
				  name="teacherIds"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Subject Teachers</FormLabel>
					  <ScrollArea className="h-[200px] border rounded-md p-4">
						<div className="space-y-2">
						  {teachers.map((teacher) => (
							<div key={teacher.id} className="flex items-center space-x-2">
							  <Checkbox
								checked={field.value?.includes(teacher.id)}
								onCheckedChange={(checked) => {
								  const currentValues = field.value || [];
								  const newValues = checked
									? [...currentValues, teacher.id]
									: currentValues.filter(id => id !== teacher.id);
								  field.onChange(newValues);
								}}
							  />
							  <label className="text-sm">{teacher.user.name}</label>
							</div>
						  ))}
						</div>
					  </ScrollArea>
					  <FormMessage />
					</FormItem>
				  )}
				/>
			  </TabsContent>

			  <TabsContent value="additional" className="space-y-4">
				<FormField
				  control={form.control}
				  name="description"
				  render={({ field }) => (
					<FormItem>
					  <FormLabel>Description</FormLabel>
					  <FormControl>
						<Input {...field} />
					  </FormControl>
					  <FormMessage />
					</FormItem>
				  )}
				/>

				<div className="grid grid-cols-2 gap-4">
				  <FormField
					control={form.control}
					name="academicYear"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Academic Year</FormLabel>
						<FormControl>
						  <Input {...field} />
						</FormControl>
						<FormMessage />
					  </FormItem>
					)}
				  />

				  <FormField
					control={form.control}
					name="semester"
					render={({ field }) => (
					  <FormItem>
						<FormLabel>Semester</FormLabel>
						<FormControl>
						  <Input {...field} />
						</FormControl>
						<FormMessage />
					  </FormItem>
					)}
				  />
				</div>
			  </TabsContent>
			</Tabs>

			<div className="flex justify-end space-x-2">
			  <Button variant="outline" type="button" onClick={onClose}>
				Cancel
			  </Button>
			  <Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Saving..." : selectedClass ? "Update" : "Create"}
			  </Button>
			</div>
		  </form>
		</Form>
	  </DialogContent>
	</Dialog>
	  );
};