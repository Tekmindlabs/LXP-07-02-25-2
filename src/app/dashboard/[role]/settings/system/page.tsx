import { SystemSettings } from "../../../../../components/dashboard/settings/SystemSettings";

export default function SystemSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">System Settings</h3>
				<p className="text-sm text-muted-foreground">
					Configure system-wide settings and preferences
				</p>
			</div>
			<SystemSettings />
		</div>
	);
}