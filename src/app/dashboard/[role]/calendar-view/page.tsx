import CalendarView from "@/components/dashboard/roles/super-admin/calendar/CalendarView";

interface CalendarViewPageProps {
	params: {
		role: string;
	};
}

export default async function CalendarViewPage({ params }: CalendarViewPageProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Calendar View</h2>
			</div>
			<CalendarView />
		</div>
	);
}
