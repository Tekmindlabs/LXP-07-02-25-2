'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	email: z.string().email({ message: 'Invalid email address' }).nullable(),
	dateOfBirth: z.date({ message: 'Date of birth is required' }),
	classId: z.string().min(1, { message: 'Class is required' }),
});



type PageProps = {
	params: {
		role: string;
		studentId: string;
	};
};

type FormData = z.infer<typeof formSchema>;

export default function EditStudentPage({ params }: PageProps) {
	const { role, studentId } = params;
	const router = useRouter();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	const { 
		data: classes = [], 
		isLoading: classesLoading,
		error: classesError 
	} = api.class.list.useQuery(undefined, {
		retry: 1
	});

	const { data: student, isLoading } = api.student.getStudent.useQuery(studentId, {
		retry: 1
	});

	useEffect(() => {
		if (classesError) {
			toast({
				title: 'Error',
				description: classesError.message || 'Failed to load classes',
				variant: 'destructive',
			});
		}
	}, [classesError, toast]);
	
	const updateStudentMutation = api.student.updateStudent.useMutation({
		onSuccess: () => {
			setIsSubmitting(false);
			toast({
				title: 'Student updated successfully',
				description: 'Student has been updated',
			});
			router.push(`/dashboard/${role}/student`);
		},
		onError: (error) => {
			setIsSubmitting(false);
			toast({
				title: 'Error',
				description: error.message || 'Failed to update student',
				variant: 'destructive',
			});
		},
	});


	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			email: '',
			dateOfBirth: new Date(),
			classId: '',
		},
	});

	useEffect(() => {

		if (student && student.studentProfile) {
			form.reset({
				name: student.name || '',
				email: student.email || '',
				dateOfBirth: student.studentProfile.dateOfBirth ? new Date(student.studentProfile.dateOfBirth) : new Date(),
				classId: student.studentProfile.classId || '',
			}, {
				keepDefaultValues: false,
			});
		}
	}, [student, form]);

	const onSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);
			await updateStudentMutation.mutateAsync({
				id: studentId,
				name: data.name,
				email: data.email || null,
				dateOfBirth: data.dateOfBirth,
				classId: data.classId,
			});
		} catch (error) {
			console.error('Error updating student:', error);
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to update student',
				variant: 'destructive',
			});
			setIsSubmitting(false);
		}
	};


	const createCredentialsMutation = api.student.createCredentials.useMutation({
		onSuccess: () => {
			toast({
				title: 'Credentials created successfully',
				description: 'Login credentials have been created and sent',
			});
		},
		onError: (error) => {
			toast({
				title: 'Error',
				description: 'Failed to create credentials: ' + error.message,
				variant: 'destructive',
			});
		},
	});

	const handleCreateCredentials = () => {
		if (!student?.email) {
			toast({
				title: 'Error',
				description: 'Student must have an email address to create login credentials',
				variant: 'destructive',
			});
			return;
		}

		const studentPassword = Math.random().toString(36).slice(-8);
		const parentPassword = Math.random().toString(36).slice(-8);
		
		createCredentialsMutation.mutate({
			studentId: studentId,
			studentPassword,
			parentPassword: student.studentProfile?.parent ? parentPassword : undefined
		});
	};

	if (isLoading || !student) {
		return <div>Loading...</div>;
	}




	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Edit Student</CardTitle>
					<Button 
						onClick={handleCreateCredentials}
						disabled={!student?.email || createCredentialsMutation.isPending}
					>
						{createCredentialsMutation.isPending ? 'Creating...' : 'Create Login Credentials'}
					</Button>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Name" {...field} />
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input 
											type="email" 
											placeholder="Email" 
											{...field} 
											value={field.value || ''} 
										/>
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="dateOfBirth"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Date of Birth</FormLabel>
									<FormControl>
										<Input 
											type="date" 
											{...field} 
											value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
											onChange={(e) => field.onChange(new Date(e.target.value))} 
										/>
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="classId"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Class</FormLabel>
									<FormControl>
										<Select 
											value={field.value} 
											onValueChange={field.onChange}
											disabled={classesLoading}
										>
											<SelectTrigger>
												<SelectValue placeholder={classesLoading ? "Loading..." : "Select class"} />
											</SelectTrigger>
											<SelectContent>
												{classesError ? (
													<SelectItem value="" disabled>Error loading classes</SelectItem>
												) : classesLoading ? (
													<SelectItem value="" disabled>Loading classes...</SelectItem>
												) : classes.length === 0 ? (
													<SelectItem value="" disabled>No classes available</SelectItem>
												) : (
													classes.map((cls) => (
														<SelectItem key={cls.id} value={cls.id}>
															{cls.name}
														</SelectItem>
													))
												)}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>
					</div>

					<Button 
						type="submit" 
						disabled={isSubmitting || !form.formState.isValid}
					>
						{isSubmitting ? "Updating..." : "Update Student"}
					</Button>
				</form>
			</Form>
		</CardContent>
	</Card>
</div>
	);
}