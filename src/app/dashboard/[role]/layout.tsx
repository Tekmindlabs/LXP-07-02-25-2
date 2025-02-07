import { use } from 'react';
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import SuperAdminSidebar from "@/components/dashboard/roles/super-admin/layout/SuperAdminSidebar";

const superAdminNavItems = [
	{
		title: "Overview",
		href: "/dashboard/[role]",
	},
	{
		title: "Academic Calendar",
		href: "/dashboard/[role]/academic-calendar",
	},
	{
		title: "Programs",
		href: "/dashboard/[role]/program",
	},
	{
		title: "Class Groups",
		href: "/dashboard/[role]/class-group",
	},
	{
		title: "Classes",
		href: "/dashboard/[role]/class",
	},
	{
		title: "Teachers",
		href: "/dashboard/[role]/teacher",
	},
	{
		title: "Students",
		href: "/dashboard/[role]/student",
	},
	{
		title: "Subjects",
		href: "/dashboard/[role]/subject",
	},
	{
		title: "Timetables",
		href: "/dashboard/[role]/timetable",
	},
	{
		title: "Classrooms",
		href: "/dashboard/[role]/classroom",
	},
	{
		title: "Users",
		href: "/dashboard/[role]/users",
	},
	{
		title: "Class Activities",
		href: "/dashboard/[role]/class-activity",
	},
	{
		title: "Attendance Management",
		href: "/dashboard/[role]/attendance",
	},
	{
		title: "Messaging",
		href: "/dashboard/[role]/messaging",
	},
	{
		title: "Notifications",
		href: "/dashboard/[role]/notification",
	},
	{
		title: "Settings",
		href: "/dashboard/[role]/settings",
	},
	{
		title: "Knowledge Base",
		href: "/dashboard/[role]/knowledge-base",
	},
];

const coordinatorNavItems = [
	{
		title: "Overview",
		href: "/dashboard/[role]",
	},
	{
		title: "Academic Calendar",
		href: "/dashboard/[role]/academic-calendar",
	},
	{
		title: "Programs",
		href: "/dashboard/[role]/program",
	},
	{
		title: "Class Groups",
		href: "/dashboard/[role]/class",
	},
	{
		title: "Teachers",
		href: "/dashboard/[role]/teacher",
	},
	{
		title: "Students",
		href: "/dashboard/[role]/student",
	},
	{
		title: "Activities",
		href: "/dashboard/[role]/class-activity",
	},
	{
		title: "Timetables",
		href: "/dashboard/[role]/timetable",
	},
	{
		title: "Messaging",
		href: "/dashboard/[role]/messaging",
	},
	{
		title: "Notifications",
		href: "/dashboard/[role]/notification",
	},
	{
		title: "Knowledge Base",
		href: "/dashboard/[role]/knowledge-base",
	},
];

const teacherNavItems = [
	{
		title: "Overview",
		href: "/dashboard/[role]",
	},
	{
		title: "Academic Calendar",
		href: "/dashboard/[role]/academic-calendar",
	},
	{
		title: "Classes",
		href: "/dashboard/[role]/class",
	},
	{
		title: "Students",
		href: "/dashboard/[role]/student",
	},
	{
		title: "Activities",
		href: "/dashboard/[role]/class-activity",
	},
	{
		title: "Messaging",
		href: "/dashboard/[role]/messaging",
	},
	{
		title: "Notifications",
		href: "/dashboard/[role]/notification",
	},
	{
		title: "Knowledge Base",
		href: "/dashboard/[role]/knowledge-base",
	},
];

const studentNavItems = [
	{
		title: "Overview",
		href: "/dashboard/[role]",
	},
	{
		title: "Activities",
		href: "/dashboard/[role]/class-activity",
	},
	{
		title: "Knowledge Base",
		href: "/dashboard/[role]/knowledge-base",
	},
];

export default async function RoleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { role: string };
}) {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/auth/signin");
	}

	const userRoles = session.user.roles.map((r) => r.toLowerCase());
	const currentRole = params.role.toLowerCase();

	if (!currentRole || !userRoles.includes(currentRole)) {
		redirect(`/dashboard/${userRoles[0]?.toLowerCase() ?? ''}`);
	}

	const getNavItems = (role: string) => {
		switch (role) {
			case 'super-admin':
				return superAdminNavItems;
			case 'coordinator':
				return coordinatorNavItems;
			case 'teacher':
				return teacherNavItems;
			case 'student':
				return studentNavItems;
			default:
				return [];
		}
	};

	const navItems = getNavItems(currentRole);
	const isSuperAdmin = currentRole === 'super-admin';

	return (



	<div className="flex min-h-screen">
		<aside className="w-64 border-r bg-background">
			{isSuperAdmin ? (
				<SuperAdminSidebar />
			) : (
				<SidebarNav items={navItems} />
			)}
		</aside>
		<div className="flex-1 flex flex-col">
			<main className="flex-1 p-6">
				{children}
			</main>
		</div>
	</div>
	);
}
