"use client";

import { Building, Calendar, Palette, Settings } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function SettingsNavigation() {
	const pathname = usePathname();
	const { role } = useParams();

	const navigationItems = [
		{
			title: "System Settings",
			href: `/dashboard/${role}/settings/system`,
			icon: Settings,
		},
		{
			title: "Institute Settings",
			href: `/dashboard/${role}/settings/institute`,
			icon: Building,
		},
		{
			title: "Branding & Design",
			href: `/dashboard/${role}/settings/branding`,
			icon: Palette,
		},
		{
			title: "Academic Year",
			href: `/dashboard/${role}/settings/academic-year`,
			icon: Calendar,
		},
	];

	return (
		<nav className="space-y-2">
			{navigationItems.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
						pathname === item.href
							? "bg-primary text-primary-foreground"
							: "hover:bg-muted"
					}`}
				>
					<item.icon className="w-5 h-5" />
					<span>{item.title}</span>
				</Link>
			))}
		</nav>
	);
}