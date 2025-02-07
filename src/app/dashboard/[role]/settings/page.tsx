"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SettingsPage() {
	const { role } = useParams();
	const settingsSections = [
		{
			title: "Academic Year",
			description: "Configure academic year settings and calendar",
			href: `/dashboard/${role}/settings/academic-year`,
		},
		{
			title: "Branding",
			description: "Customize institute branding and appearance",
			href: `/dashboard/${role}/settings/branding`,
		},
		{
			title: "Institute",
			description: "Manage institute details and configuration",
			href: `/dashboard/${role}/settings/institute`,
		},
		{
			title: "System",
			description: "Configure system-wide settings and preferences",
			href: `/dashboard/${role}/settings/system`,
		},
	];

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Settings</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{settingsSections.map((section) => (
					<Link href={section.href} key={section.title}>
						<Card className="hover:bg-muted/50 transition-colors">
							<CardHeader>
								<CardTitle>{section.title}</CardTitle>
								<CardDescription>{section.description}</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}