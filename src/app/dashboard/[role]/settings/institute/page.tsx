import { InstituteSettings } from "@/components/dashboard/settings/InstituteSettings";

export default function InstituteSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Institute Settings</h3>
				<p className="text-sm text-muted-foreground">
					Manage your institute's information and configuration
				</p>
			</div>
			<InstituteSettings />
		</div>
	);
}