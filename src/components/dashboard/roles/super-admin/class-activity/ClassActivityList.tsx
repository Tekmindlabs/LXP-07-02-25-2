'use client';

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { GradeActivityModal } from "@/components/dashboard/gradebook/GradeActivityModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActivityType, ActivityWithBasicSubmissions } from "@/types/class-activity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";




interface Props {
	onEdit: (id: string) => void;
}




interface Filters {
	search: string;
	type?: ActivityType;
	classGroupId?: string;
	classId?: string;
}

export default function ClassActivityList({ onEdit }: Props) {
	const [filters, setFilters] = useState<Filters>({ search: "" });
	const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
	const [gradeActivityId, setGradeActivityId] = useState<string | null>(null);
	const { toast } = useToast();

	const utils = api.useContext();
	const { data: activities } = api.classActivity.getAll.useQuery(filters) as { data: ActivityWithBasicSubmissions[] | undefined };
	const { data: classGroups } = api.classGroup.getAllClassGroups.useQuery();
	const { data: selectedActivityDetails } = api.classActivity.getById.useQuery(
		selectedActivity as string,
		{ enabled: !!selectedActivity }
	) as { data: ActivityWithBasicSubmissions | undefined };


	const deleteMutation = api.classActivity.delete.useMutation({
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Activity deleted successfully",
			});
			utils.classActivity.getAll.invalidate();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const handleDelete = (id: string) => {
		if (window.confirm("Are you sure you want to delete this activity?")) {
			deleteMutation.mutate(id);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex space-x-4">
				<Input
					placeholder="Search activities..."
					value={filters.search}
					onChange={(e) => setFilters({ ...filters, search: e.target.value })}
					className="max-w-sm"
				/>
				<Select
					value={filters.type || "ALL"}
					onValueChange={(value) => setFilters({ ...filters, type: value === "ALL" ? undefined : value as ActivityType })}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Types</SelectItem>
						{[
							'QUIZ_MULTIPLE_CHOICE',
							'QUIZ_DRAG_DROP',
							'QUIZ_FILL_BLANKS',
							'QUIZ_MEMORY',
							'QUIZ_TRUE_FALSE',
							'GAME_WORD_SEARCH',
							'GAME_CROSSWORD',
							'GAME_FLASHCARDS',
							'VIDEO_YOUTUBE',
							'READING',
							'CLASS_ASSIGNMENT',
							'CLASS_PROJECT',
							'CLASS_PRESENTATION',
							'CLASS_TEST',
							'CLASS_EXAM'
						].map((type) => (
							<SelectItem key={type} value={type}>
								{type.replace(/_/g, ' ')}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filters.classGroupId || "ALL"}
					onValueChange={(value) => setFilters({ ...filters, classGroupId: value === "ALL" ? undefined : value })}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by class group" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Class Groups</SelectItem>
						{classGroups?.map((group) => (
							<SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Deadline</TableHead>
							<TableHead>Class/Group</TableHead>
							<TableHead>Submissions</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{activities?.map((activity) => (
							<TableRow key={activity.id}>
								<TableCell>{activity.title}</TableCell>
								<TableCell>{activity.type}</TableCell>
								<TableCell>
									{activity.deadline
										? format(new Date(activity.deadline), "PPP")
										: "No deadline"}
								</TableCell>
								<TableCell>
									{activity.class?.name || activity.classGroup?.name || "N/A"}
								</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedActivity(activity.id)}
									>
										View ({activity.submissions?.length || 0})
									</Button>
								</TableCell>
								<TableCell>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(activity.id)}
										>
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setGradeActivityId(activity.id)}
										>
											Grade
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDelete(activity.id)}
										>
											Delete
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{selectedActivity && (
				<Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
					<DialogContent className="max-w-3xl">
						<DialogHeader>
							<DialogTitle>Activity Submissions</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<h3 className="font-medium">{selectedActivityDetails?.title}</h3>
								<p className="text-sm text-gray-500">{selectedActivityDetails?.description}</p>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Student</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Submission Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selectedActivityDetails?.submissions?.map((submission) => (
										<TableRow key={submission.id}>
											<TableCell>{submission.student.name}</TableCell>
											<TableCell>{submission.status}</TableCell>
											<TableCell>
												{submission.submittedAt
													? format(new Date(submission.submittedAt), "PPP")
													: 'Not submitted'}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

						</div>
					</DialogContent>
				</Dialog>
			)}

			{gradeActivityId && (
				<GradeActivityModal
					activityId={gradeActivityId}
					isOpen={!!gradeActivityId}
					onClose={() => setGradeActivityId(null)}
				/>
			)}
		</div>
	);
}