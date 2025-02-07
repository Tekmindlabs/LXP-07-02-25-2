'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useToast } from '@/hooks/use-toast';

interface Program {
	id: string;
	name: string;
	coordinatorId: string | null;
}

interface Coordinator {
	id: string;
	userId: string;
	user: {
		name: string;
		email: string;
	};
}

export const ProgramAssignment = () => {
	const { toast } = useToast();
	const [programs, setPrograms] = useState<Program[]>([]);
	const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchData = async () => {
		setLoading(true);
		try {
			// These would be actual API calls in production
			const programsResponse = await fetch('/api/programs');
			const programsData = await programsResponse.json();
			setPrograms(programsData);

			const coordinatorsResponse = await fetch('/api/coordinators');
			const coordinatorsData = await coordinatorsResponse.json();
			setCoordinators(coordinatorsData);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load data',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleAssignCoordinator = async (programId: string, coordinatorId: string) => {
		try {
			await fetch(`/api/programs/${programId}/coordinator`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ coordinatorId }),
			});

			setPrograms(prev => 
				prev.map(program => 
					program.id === programId 
						? { ...program, coordinatorId } 
						: program
				)
			);

			toast({
				title: 'Success',
				description: 'Coordinator assigned successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to assign coordinator',
				variant: 'destructive',
			});
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Program Coordinator Assignments</h2>
			
			{loading ? (
				<div>Loading...</div>
			) : (
				<div className="grid gap-4">
					{programs.map(program => (
						<Card key={program.id} className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold">{program.name}</h3>
									<p className="text-sm text-gray-500">
										{program.coordinatorId 
											? `Current Coordinator: ${coordinators.find(c => c.id === program.coordinatorId)?.user.name}` 
											: 'No coordinator assigned'}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Select
										value={program.coordinatorId || 'NO_SELECTION'}
										onValueChange={(value) => {
											if (value !== 'NO_SELECTION') {
												handleAssignCoordinator(program.id, value);
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select Coordinator" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="NO_SELECTION">Select Coordinator</SelectItem>
											{coordinators.map(coordinator => (
												<SelectItem key={coordinator.id} value={coordinator.id}>
													{coordinator.user.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
};