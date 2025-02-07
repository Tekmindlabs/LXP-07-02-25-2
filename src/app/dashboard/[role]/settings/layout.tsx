import { SettingsNavigation } from "@/components/dashboard/settings/SettingsNavigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen">
			<nav className="w-64 border-r p-4 bg-background">
				<SettingsNavigation />
			</nav>
			<main className="flex-1 p-6">
				{children}
			</main>
		</div>
	);
}