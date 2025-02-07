'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { ClassGroupList } from "./ClassGroupList";
import { ClassGroupForm } from "./ClassGroupForm";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Users, BookOpen, GraduationCap, School } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ClassGroupManagement = () => {
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const router = useRouter();

	const handleViewDetails = (id: string) => {
		router.push(`/dashboard/super-admin/class-group/${id}/view`);
	};

	const { 
		data: classGroups, 
		isLoading: groupsLoading,
		error: groupsError,
		refetch: refetchGroups 
	} = api.classGroup.getAllClassGroups.useQuery();

	const { 
		data: programs,
		isLoading: programsLoading,
		error: programsError 
	} = api.program.getAll.useQuery({
		page: 1,
		pageSize: 10
	});

	const { data: analyticsData } = api.classGroup.getOverallAnalytics.useQuery();

	const handleSuccess = () => {
		setSelectedGroupId(null);
		setIsCreating(false);
		void refetchGroups();
	};

	if (groupsError || programsError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{groupsError?.message || programsError?.message}
				</AlertDescription>
			</Alert>
		);
	}

	const isLoading = groupsLoading || programsLoading;
	const totalGroups = classGroups?.length || 0;
	const activeGroups = classGroups?.filter(g => g.status === 'ACTIVE').length || 0;
	const totalClasses = classGroups?.reduce((acc, group) => acc + group.classes.length, 0) || 0;
	const totalSubjects = classGroups?.reduce((acc, group) => acc + group.subjects.length, 0) || 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Class Group Management</h2>
				<Dialog open={isCreating} onOpenChange={setIsCreating}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" />
							Create Class Group
						</Button>
					</DialogTrigger>
					<DialogContent size="wide">
						<DialogHeader>
							<DialogTitle>Create New Class Group</DialogTitle>
						</DialogHeader>
						<ClassGroupForm 
							programs={programs?.programs.map(p => ({
								id: p.id,
								name: p.name || 'Unnamed Program'
							})) || []}
							onSuccess={handleSuccess}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Groups</CardTitle>
						<School className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalGroups}</div>
						{analyticsData?.studentGrowth && (
							<p className={`text-xs ${analyticsData.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
								{analyticsData.studentGrowth > 0 ? '+' : ''}{Math.round(analyticsData.studentGrowth)}% from last month
							</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Groups</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeGroups}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Classes</CardTitle>
						<GraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalClasses}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Performance</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analyticsData?.averagePerformance || 0}%</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Class Groups Overview</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : (
						<>
							<ClassGroupList 
								classGroups={classGroups?.map(group => ({
									...group,
									program: {
										...group.program,
										name: group.program.name || 'Unnamed Program'
									}
								})) || []} 
								onEdit={(id) => setSelectedGroupId(id)}
								onView={handleViewDetails}
							/>
							{selectedGroupId && (
								<Dialog open={!!selectedGroupId} onOpenChange={(open) => !open && setSelectedGroupId(null)}>
									<DialogContent size="wide">
										<DialogHeader>
											<DialogTitle>Edit Class Group</DialogTitle>
										</DialogHeader>
										<ClassGroupForm 
											programs={programs?.programs.map(p => ({
												id: p.id,
												name: p.name || 'Unnamed Program'
											})) || []}
											selectedClassGroup={classGroups?.find(g => g.id === selectedGroupId) ? {
												id: classGroups.find(g => g.id === selectedGroupId)!.id,
												name: classGroups.find(g => g.id === selectedGroupId)!.name,
												description: classGroups.find(g => g.id === selectedGroupId)!.description,
												programId: classGroups.find(g => g.id === selectedGroupId)!.programId,
												status: classGroups.find(g => g.id === selectedGroupId)!.status,
												calendarId: classGroups.find(g => g.id === selectedGroupId)!.calendarId
											} : undefined}
											onSuccess={handleSuccess}
										/>
									</DialogContent>
								</Dialog>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
