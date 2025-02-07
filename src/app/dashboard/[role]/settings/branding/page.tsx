import { BrandingSettings } from "../../../../../components/dashboard/settings/BrandingSettings";

export default function BrandingSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Branding & Design</h3>
				<p className="text-sm text-muted-foreground">
					Customize your institute's branding and appearance
				</p>
			</div>
			<BrandingSettings />
		</div>
	);
}