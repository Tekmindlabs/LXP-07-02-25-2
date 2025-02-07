'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface PageParams {
	role: string;
}

const formSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
	dateOfBirth: z.date({ message: 'Date of birth is required' }),
	classId: z.string().min(1, { message: 'Class is required' }),
	parentName: z.string().optional(),
	parentEmail: z.string().email().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateStudentPage({ params }: { params: PageParams }) {
	const router = useRouter();
	const role = params.role;
	const { toast } = useToast();

	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [copied, setCopied] = useState(false);
	const [parentPassword, setParentPassword] = useState('');
	const [showParentPassword, setShowParentPassword] = useState(false);
	const [copiedParent, setCopiedParent] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleParentCopy = () => {
		navigator.clipboard.writeText(parentPassword);
		setCopiedParent(true);
		setTimeout(() => setCopiedParent(false), 2000);
	};

	const { data: classes = [] } = api.class.list.useQuery();
	
	const createStudentMutation = api.student.createStudent.useMutation({
		onSuccess: (result) => {
			if (result.studentProfile?.credentials) {
				setPassword(result.studentProfile.credentials);
			}
			if (result.parentProfile?.credentials) {
				setParentPassword(result.parentProfile.credentials);
			}
			toast({
				title: 'Student created successfully',
				description: `Student ${result.name} has been created`,
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create student',
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
			parentName: '',
			parentEmail: '',
		},
	});

	const onSubmit = (data: FormData) => {
		createStudentMutation.mutate(data);
	};

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Student Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Student Information</h3>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Student Name" {...field} />
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
										<Input type="email" placeholder="Student Email" {...field} />
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
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue placeholder="Select class" />
											</SelectTrigger>
											<SelectContent>
												{(classes as any[]).map((cls) => (
													<SelectItem key={cls.id} value={cls.id}>
														{cls.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>
					</div>

					{/* Guardian Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Guardian Information</h3>
						<FormField
							control={form.control}
							name="parentName"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Guardian Name</FormLabel>
									<FormControl>
										<Input placeholder="Guardian Name" {...field} />
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>
						<FormField
							control={form.control}
							name="parentEmail"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Guardian Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Guardian Email" {...field} />
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>
					</div>

					<Button type="submit" className="w-full">Create Student</Button>
				</form>
			</Form>

			{/* Credentials Section - Outside Form */}
			{password && (
				<div className="space-y-2 p-4 border rounded-lg bg-muted">
					<FormLabel className="font-bold">Generated Credentials</FormLabel>
					<div className="flex items-center">
						<Input
							type={showPassword ? 'text' : 'password'}
							value={password}
							readOnly
							className="font-mono"
						/>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setShowPassword(!showPassword)}
							className="ml-2"
						>
							{showPassword ? 'Hide' : 'Show'}
						</Button>
						<Button
							onClick={handleCopy}
							className="ml-2"
							disabled={copied}
						>
							{copied ? 'Copied!' : 'Copy'}
						</Button>
					</div>
				</div>
			)}

			{parentPassword && (
				<div className="space-y-2 p-4 border rounded-lg bg-muted">
					<FormLabel className="font-bold">Guardian Credentials</FormLabel>
					<div className="flex items-center">
						<Input
							type={showParentPassword ? 'text' : 'password'}
							value={parentPassword}
							readOnly
							className="font-mono"
						/>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setShowParentPassword(!showParentPassword)}
							className="ml-2"
						>
							{showParentPassword ? 'Hide' : 'Show'}
						</Button>
						<Button
							onClick={handleParentCopy}
							className="ml-2"
							disabled={copiedParent}
						>
							{copiedParent ? 'Copied!' : 'Copy'}
						</Button>
					</div>
				</div>
			)}

			{(password || parentPassword) && (
				<Button 
					onClick={() => router.push(`/dashboard/${role}/student`)}
					className="w-full"
				>
					Continue to Student List
				</Button>
			)}
		</div>

	);
}


