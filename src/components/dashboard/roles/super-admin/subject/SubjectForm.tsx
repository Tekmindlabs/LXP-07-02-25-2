'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TRPCClientErrorLike } from '@trpc/client';

import { api } from "@/utils/api";
import { Status } from "@prisma/client";


interface SubjectFormData {
	name: string;
	code: string;
	description?: string;
	classGroupIds: string[];
	teacherIds: string[];
	status: Status;
}

interface SubjectFormProps {
	selectedSubject?: any;
	classGroups: any[];
	teachers: any[];
	onSuccess: () => void;
}

export const SubjectForm = ({ 
	selectedSubject, 
	classGroups, 
	teachers, 
	onSuccess 
}: SubjectFormProps) => {
	const [formData, setFormData] = useState<SubjectFormData>(() => ({
		name: selectedSubject?.name || "",
		code: selectedSubject?.code || "",
		description: selectedSubject?.description || "",
		classGroupIds: selectedSubject?.classGroups?.map((g: any) => g.id) || [],
		teacherIds: selectedSubject?.teachers?.map((t: any) => t.teacher.id) || [],
		status: selectedSubject?.status || Status.ACTIVE,
	}));

	const { toast } = useToast();
	const utils = api.useContext();

	const createMutation = api.subject.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Subject created successfully",
			});
			utils.subject.searchSubjects.invalidate();
			resetForm();
			onSuccess();
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateMutation = api.subject.update.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Subject updated successfully",
			});
			utils.subject.searchSubjects.invalidate();
			resetForm();
			onSuccess();
		},
		onError: (error: TRPCClientErrorLike<any>) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setFormData({
			name: "",
			code: "",
			description: "",
			classGroupIds: [],
			teacherIds: [],
			status: Status.ACTIVE,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedSubject) {
			updateMutation.mutate({
				id: selectedSubject.id,
				...formData,
			});
		} else {
			createMutation.mutate(formData);
		}
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{selectedSubject ? "Edit" : "Create"} Subject</DialogTitle>
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
					<Label htmlFor="code">Code</Label>
					<Input
						id="code"
						value={formData.code}
						onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
					<Label>Class Groups</Label>
					<MultiSelect
						options={classGroups.map(group => ({
							label: group.name,
							value: group.id,
						}))}
						value={formData.classGroupIds}
						onChange={(values) => setFormData({ ...formData, classGroupIds: values })}
						placeholder="Select class groups"
					/>
				</div>

				<div>
					<Label>Teachers</Label>
					<MultiSelect
						options={teachers.map(teacher => ({
							label: teacher.user.name || "Unnamed Teacher",
							value: teacher.id,
						}))}
						value={formData.teacherIds}
						onChange={(values) => setFormData({ ...formData, teacherIds: values })}
						placeholder="Select teachers"
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

				<div className="flex justify-end space-x-2">
					<Button variant="outline" type="button" onClick={onSuccess}>
						Cancel
					</Button>
					<Button type="submit" disabled={createMutation.status === 'pending' || updateMutation.status === 'pending'}>
						{createMutation.status === 'pending' || updateMutation.status === 'pending' ? "Saving..." : selectedSubject ? "Update" : "Create"}
					</Button>
				</div>
			</form>
		</DialogContent>
	);
};
