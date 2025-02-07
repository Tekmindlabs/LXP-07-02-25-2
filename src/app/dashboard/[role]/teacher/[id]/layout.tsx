import { use } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

type PageParams = {
	role: string;
	id: string;
};

export default function TeacherProfileLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<PageParams>;
}) {
	const { role: roleParam } = use(params as Promise<PageParams>);



	return (
		<div className="space-y-6">
			<Breadcrumb>
				<BreadcrumbItem>
					<BreadcrumbLink href={`/dashboard/${roleParam}`}>Dashboard</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<ChevronRight className="h-4 w-4" />
					<BreadcrumbLink href={`/dashboard/${roleParam}/teachers`}>Teachers</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<ChevronRight className="h-4 w-4" />
					<span>Profile</span>
				</BreadcrumbItem>
			</Breadcrumb>
			{children}
		</div>
	);
}