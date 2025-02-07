"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";

type CreateNotificationProps = {
	onCancel: () => void;
};

export default function CreateNotification({ onCancel }: CreateNotificationProps) {
	const { toast } = useToast();
	const utils = api.useContext();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [type, setType] = useState<"ANNOUNCEMENT" | "ASSIGNMENT" | "GRADE" | "REMINDER" | "SYSTEM">("ANNOUNCEMENT");
	const [scheduledFor, setScheduledFor] = useState<Date | undefined>();
	const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
	const [selectedClassGroups, setSelectedClassGroups] = useState<string[]>([]);
	const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	const { data: programs } = api.program.getAll.useQuery();
	const { data: classGroups } = api.classGroup.getAll.useQuery();
	const { data: classes } = api.class.getAll.useQuery();
	const { data: users } = api.user.getAll.useQuery();

	const createNotification = api.notification.create.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Notification created successfully",
			});
			utils.notification.getAll.invalidate();
			onCancel();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const handleSubmit = () => {
		if (!title.trim() || !content.trim()) {
			toast({
				title: "Error",
				description: "Please fill in all required fields",
				variant: "destructive",
			});
			return;
		}

		createNotification.mutate({
			title: title.trim(),
			content: content.trim(),
			type,
			scheduledFor,
			recipients: {
				programIds: selectedPrograms,
				classGroupIds: selectedClassGroups,
				classIds: selectedClasses,
				userIds: selectedUsers,
			},
		});
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Title</Label>
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter notification title"
				/>
			</div>

			<div className="space-y-2">
				<Label>Content</Label>
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Enter notification content"
					rows={4}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label>Type</Label>
					<Select
						value={type}
						onValueChange={(value) => setType(value as any)}
					>
						<option value="ANNOUNCEMENT">Announcement</option>
						<option value="ASSIGNMENT">Assignment</option>
						<option value="GRADE">Grade</option>
						<option value="REMINDER">Reminder</option>
						<option value="SYSTEM">System</option>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Schedule For (Optional)</Label>
					<DateTimePicker
						value={scheduledFor}
						onChange={setScheduledFor}
					/>
				</div>
			</div>

			<div className="space-y-4">
				<Label>Recipients</Label>
				<div className="grid grid-cols-2 gap-4">
					<Card className="p-4">
						<Label>Programs</Label>
						<ScrollArea className="h-40 mt-2">
							{programs?.map((program) => (
								<div key={program.id} className="flex items-center space-x-2 py-1">
									<input
										type="checkbox"
										checked={selectedPrograms.includes(program.id)}
										onChange={(e) => {
											setSelectedPrograms(
												e.target.checked
													? [...selectedPrograms, program.id]
													: selectedPrograms.filter((id) => id !== program.id)
											);
										}}
									/>
									<span>{program.name}</span>
								</div>
							))}
						</ScrollArea>
					</Card>

					<Card className="p-4">
						<Label>Class Groups</Label>
						<ScrollArea className="h-40 mt-2">
							{classGroups?.map((group) => (
								<div key={group.id} className="flex items-center space-x-2 py-1">
									<input
										type="checkbox"
										checked={selectedClassGroups.includes(group.id)}
										onChange={(e) => {
											setSelectedClassGroups(
												e.target.checked
													? [...selectedClassGroups, group.id]
													: selectedClassGroups.filter((id) => id !== group.id)
											);
										}}
									/>
									<span>{group.name}</span>
								</div>
							))}
						</ScrollArea>
					</Card>

					<Card className="p-4">
						<Label>Classes</Label>
						<ScrollArea className="h-40 mt-2">
							{classes?.map((cls) => (
								<div key={cls.id} className="flex items-center space-x-2 py-1">
									<input
										type="checkbox"
										checked={selectedClasses.includes(cls.id)}
										onChange={(e) => {
											setSelectedClasses(
												e.target.checked
													? [...selectedClasses, cls.id]
													: selectedClasses.filter((id) => id !== cls.id)
											);
										}}
									/>
									<span>{cls.name}</span>
								</div>
							))}
						</ScrollArea>
					</Card>

					<Card className="p-4">
						<Label>Individual Users</Label>
						<ScrollArea className="h-40 mt-2">
							{users?.map((user) => (
								<div key={user.id} className="flex items-center space-x-2 py-1">
									<input
										type="checkbox"
										checked={selectedUsers.includes(user.id)}
										onChange={(e) => {
											setSelectedUsers(
												e.target.checked
													? [...selectedUsers, user.id]
													: selectedUsers.filter((id) => id !== user.id)
											);
										}}
									/>
									<span>{user.name}</span>
								</div>
							))}
						</ScrollArea>
					</Card>
				</div>
			</div>

			<div className="flex justify-end space-x-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={createNotification.isLoading}>
					Create Notification
				</Button>
			</div>
		</div>
	);
}