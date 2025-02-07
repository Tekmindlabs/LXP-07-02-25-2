'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface GradeState {
	obtained: number;
	total: number;
	feedback?: string;
}

interface GradeActivityModalProps {
	activityId: string;
	isOpen: boolean;
	onClose: () => void;
}

export function GradeActivityModal({ activityId, isOpen, onClose }: GradeActivityModalProps) {
	const { toast } = useToast();
	const [grades, setGrades] = useState<Record<string, GradeState>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const utils = api.useContext();
	const toastShownRef = useRef(false);

	// Fetch activity details and student submissions
	const { data: activity, isLoading, error: queryError } = api.classActivity.getById.useQuery(
		activityId,
		{ enabled: isOpen }
	);

	// Initialize grades from activity data
	useEffect(() => {
		if (activity?.submissions) {
			const initialGrades = activity.submissions.reduce((acc, submission) => ({
				...acc,
				[submission.studentId]: {
					obtained: submission.obtainedMarks ?? 0,
					total: submission.totalMarks ?? 0,
					feedback: submission.feedback ?? ''
				}
			}), {});
			setGrades(initialGrades);
		}
	}, [activity]);

	// Mutation for saving grades
	const gradeMutation = api.gradebook.gradeActivity.useMutation({
		onMutate: () => {
			// Optimistic update can be added here if needed
		},
		onSuccess: () => {
			// Don't show success toast here as we're handling it in handleSaveGrades
		},
		onError: (error) => {
			console.error('Mutation error:', error);
			// Don't show error toast here as we're handling it in handleSaveGrades
		},
	});


	const validateGradeChange = useCallback((currentGrade: { obtained: number; total: number }, field: 'obtained' | 'total', value: number) => {
		if (field === 'obtained' && value > currentGrade.total) {
			return false;
		}
		if (field === 'total' && value < currentGrade.obtained) {
			return false;
		}
		return true;
	}, []);

	const handleGradeChange = useCallback((studentId: string, field: 'obtained' | 'total' | 'feedback', value: string) => {
		const numValue = field === 'feedback' ? value : (value === '' ? 0 : Number(value));
		const currentGrade = grades[studentId] || { obtained: 0, total: 0 };

		if (field !== 'feedback') {
			const isValid = validateGradeChange(currentGrade, field, numValue as number);
			if (!isValid && !toastShownRef.current) {
				toastShownRef.current = true;
				setTimeout(() => {
					toastShownRef.current = false;
				}, 100);
				
				toast({
					title: "Error",
					description: field === 'obtained' ? 
						"Obtained marks cannot exceed total marks" : 
						"Total marks cannot be less than obtained marks",
					variant: "destructive",
				});
				return;
			}
		}

		setGrades(prev => ({
			...prev,
			[studentId]: {
				...prev[studentId] || { obtained: 0, total: 0 },
				[field]: numValue
			}
		}));
	}, [grades, toast, validateGradeChange]);

	const handleSaveGrades = useCallback(async () => {
		setError(null);
		if (Object.keys(grades).length === 0) {
			setError("Please enter grades for at least one student");
			return;
		}

		try {
            setIsSaving(true);
            const validGrades = Object.entries(grades).filter(([_, grade]) => {
                return typeof grade.obtained === 'number' && 
                       typeof grade.total === 'number' &&
                       !isNaN(grade.obtained) && 
                       !isNaN(grade.total) &&
                       grade.total > 0 &&
                       grade.obtained <= grade.total;
            });

            if (validGrades.length === 0) {
                setError("Please enter valid marks for at least one student. Ensure obtained marks don't exceed total marks.");
                setIsSaving(false);
                return;
            }

            // Save grades sequentially with proper error handling
            for (const [studentId, grade] of validGrades) {
                const payload = {
                    activityId,
                    studentId,
                    obtainedMarks: grade.obtained,
                    totalMarks: grade.total,
                    feedback: grade.feedback || '',
                };

                try {
                    await gradeMutation.mutateAsync(payload);
                } catch (mutationError: any) {
                    // Handle permission error specifically
                    if (mutationError?.message?.includes('permission')) {
                        toast({
                            title: "Permission Denied",
                            description: "You don't have permission to grade this activity. Please contact your administrator.",
                            variant: "destructive",
                        });
                        throw new Error("Permission denied to grade activity");
                    }
                    console.error('Error saving grade for student:', studentId, mutationError);
                    throw mutationError;
                }
            }

            toast({
                title: "Success",
                description: "Grades saved successfully",
            });
            await utils.classActivity.getById.invalidate(activityId);
            onClose();
        } catch (error: any) {
            console.error('Error saving grades:', error);
            const errorMessage = error?.message?.includes('Permission denied') 
                ? "You don't have permission to grade this activity"
                : "Failed to save grades. Please try again.";
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
	}, [grades, activityId, gradeMutation, toast, utils.classActivity, onClose]);


	// Loading state
	if (isLoading) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Loading...</DialogTitle>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		);
	}

	// Error state
	if (queryError) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Error loading activity</DialogTitle>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		);
	}

	// No activity state
	if (!activity) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Activity not found</DialogTitle>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Grade Activity: {activity.title}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{error && (
						<div className="text-red-500 text-sm mb-4">
							{error}
						</div>
					)}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student</TableHead>
								<TableHead>Obtained Marks</TableHead>
								<TableHead>Total Marks</TableHead>
								<TableHead>Feedback</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{activity.submissions?.map((submission) => (
								<TableRow key={submission.studentId}>
									<TableCell>{submission.student?.name ?? 'Unknown Student'}</TableCell>
									<TableCell>
										<Input
											type="number"
											min={0}
											value={grades[submission.studentId]?.obtained ?? submission.obtainedMarks ?? ''}
											onChange={(e) => handleGradeChange(submission.studentId, 'obtained', e.target.value)}
											className={`w-20 ${
												grades[submission.studentId]?.obtained > grades[submission.studentId]?.total 
												? 'border-red-500' 
												: ''
											}`}
										/>
									</TableCell>
									<TableCell>
										<Input
											type="number"
											min={0}
											value={grades[submission.studentId]?.total ?? submission.totalMarks ?? ''}
											onChange={(e) => handleGradeChange(submission.studentId, 'total', e.target.value)}
											className={`w-20 ${
												grades[submission.studentId]?.total < grades[submission.studentId]?.obtained 
												? 'border-red-500' 
												: ''
											}`}
										/>
									</TableCell>
									<TableCell>
										<Textarea
											placeholder="Add feedback..."
											value={grades[submission.studentId]?.feedback ?? submission.feedback ?? ''}
											onChange={(e) => handleGradeChange(submission.studentId, 'feedback', e.target.value)}
											className="h-20"
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					<div className="flex justify-end space-x-2">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button 
							onClick={handleSaveGrades} 
							disabled={isSaving}
						>
							{isSaving ? 'Saving...' : 'Save Grades'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}