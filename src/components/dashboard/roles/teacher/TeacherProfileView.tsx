import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import PeriodDialog from "../super-admin/timetable/PeriodDialog";
import type { Period } from "@prisma/client";
import type { RouterOutputs } from "@/utils/api";

type ExtendedPeriod = Period & {
	subject: { name: string };
	classroom: { name: string };
	timetable: { id: string };
};

type ViewMode = 'daily' | 'weekly' | 'monthly';

interface TeacherProfileViewProps {
	teacherId: string;
}

export default function TeacherProfileView({ teacherId }: TeacherProfileViewProps) {
	const [activeTab, setActiveTab] = useState('info');
	const [calendarView, setCalendarView] = useState<ViewMode>('monthly');
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<ExtendedPeriod | null>(null);

	const { data: teacher, isLoading } = api.teacher.getById.useQuery(teacherId);
	const utils = api.useContext();

	if (isLoading) return <div>Loading...</div>;
	if (!teacher?.teacherProfile) return <div>Teacher not found</div>;

	const timetableId = teacher.teacherProfile.classes[0]?.class.timetable?.id;
	const assignments = teacher.teacherProfile.classes.flatMap(teacherClass => 
		teacherClass.class.activities?.map(activity => ({
			...activity,
			className: teacherClass.class.name,
			classGroupName: teacherClass.class.classGroup.name
		})) || []
	);


	const handlePeriodClick = (period: ExtendedPeriod) => {
		setSelectedPeriod(period);
		setIsDialogOpen(true);
	};

	const handleAddPeriod = () => {
		setSelectedPeriod(null);
		setIsDialogOpen(true);
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setSelectedPeriod(null);
	};

	const handlePeriodSave = () => {
		utils.teacher.getById.invalidate(teacherId);
	};

	const getScheduleByDay = (date: Date) => {
		if (!teacher?.teacherProfile) return [];
		
		const periods = teacher.teacherProfile.classes.flatMap(teacherClass => 
			teacherClass.class.timetable?.periods.filter(period => 
				new Date(period.startTime).getDay() === date.getDay()
			) ?? []
		).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

		return periods.map(period => ({
			...period,
			subject: { name: period.subject.name },
			classroom: { name: period.classroom.name },
			timetable: { id: period.timetableId }
		}));
	};

	const renderScheduleView = () => {
		const periodsForSelectedDate = getScheduleByDay(selectedDate);
		
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">
						{format(selectedDate, 'EEEE, MMMM d, yyyy')} Schedule
					</h3>
					<div className="space-x-2">
						{(['daily', 'weekly', 'monthly'] as ViewMode[]).map(mode => (
							<Button 
								key={mode} 
								variant={calendarView === mode ? 'default' : 'outline'}
								onClick={() => setCalendarView(mode)}
							>
								{mode.charAt(0).toUpperCase() + mode.slice(1)}
							</Button>
						))}
					</div>
				</div>
				
				<div className="space-y-4">
					{periodsForSelectedDate.map(period => (
						<Card 
							key={period.id} 
							className="cursor-pointer hover:bg-accent"
							onClick={() => handlePeriodClick(period)}
						>
							<CardContent className="p-4">
								<div className="grid gap-2">
									<div className="flex justify-between">
										<span className="font-semibold">
											{format(new Date(period.startTime), "HH:mm")} - {format(new Date(period.endTime), "HH:mm")}
										</span>
										<span>{Math.round((new Date(period.endTime).getTime() - new Date(period.startTime).getTime()) / 60000)} mins</span>
									</div>
									<div>
										<span className="font-medium">{period.subject.name}</span>
										<span className="text-muted-foreground"> • {period.classroom.name}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
					<Button 
						className="w-full" 
						variant="outline"
						onClick={handleAddPeriod}
					>
						Add Period
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="info">Information</TabsTrigger>
					<TabsTrigger value="schedule">Schedule</TabsTrigger>
					<TabsTrigger value="assignments">Assignments</TabsTrigger>
				</TabsList>

				<TabsContent value="info">
					<Card>
						<CardHeader>
							<CardTitle>Teacher Profile</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4">
								<div>
									<h3 className="font-semibold">Name</h3>
									<p>{teacher.name}</p>
								</div>
								<div>
									<h3 className="font-semibold">Email</h3>
									<p>{teacher.email}</p>
								</div>
								<div>
									<h3 className="font-semibold">Specialization</h3>
									<p>{teacher.teacherProfile.specialization || 'Not specified'}</p>
								</div>
								<div>
									<h3 className="font-semibold">Assigned Classes</h3>
									<div className="space-y-2">
										{teacher.teacherProfile.classes.map(teacherClass => (
											<div key={teacherClass.class.id} className="flex justify-between">
												<span>{teacherClass.class.name}</span>
												<span className="text-muted-foreground">
													{teacherClass.class.classGroup.name}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="schedule">
					<div className="grid md:grid-cols-[1fr_300px] gap-6">
						<Card>
							<CardContent className="p-6">
								{renderScheduleView()}
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={(date) => date && setSelectedDate(date)}
								/>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="assignments">
					<Card>
						<CardHeader>
							<CardTitle>Upcoming Assignments</CardTitle>
						</CardHeader>
						<CardContent>
							{assignments.length > 0 ? (
								assignments.map(assignment => (
									<Card key={assignment.id} className="mb-4">
										<CardContent className="p-4">
											<div>
												<h4 className="font-semibold">{assignment.title}</h4>
												<div className="flex justify-between items-center mt-2">
													<p className="text-sm text-muted-foreground">
														Deadline: {format(new Date(assignment.deadline!), 'PPP')}
													</p>
													<span className="text-sm">
														{assignment.className} - {assignment.classGroupName}
													</span>
												</div>
												{assignment.description && (
													<p className="mt-2 text-sm">{assignment.description}</p>
												)}
											</div>
										</CardContent>
									</Card>
								))
							) : (
								<p className="text-muted-foreground text-center">No upcoming assignments</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{isDialogOpen && timetableId && (
				<PeriodDialog
					isOpen={isDialogOpen}
					onClose={handleDialogClose}
					selectedDate={selectedDate}
					timetableId={timetableId}
					period={selectedPeriod}
					onSave={handlePeriodSave}
				/>
			)}
		</div>
	);

}
