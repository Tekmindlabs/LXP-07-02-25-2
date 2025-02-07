"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";

export function SystemSettings() {
	const { toast } = useToast();
	const utils = api.useContext();

	const [settings, setSettings] = useState({
		mfaEnabled: false,
		emailNotifications: true,
		autoBackup: false,
		maintenanceMode: false,
	});

	const { mutate: updateSettings, isPending } = api.settings.updateSystemSettings.useMutation({
		onSuccess: () => {
			toast({
				title: "Settings Updated",
				description: "System settings have been saved successfully.",
			});
			utils.settings.getSystemSettings.invalidate();
		},
	});

	const handleToggle = (key: keyof typeof settings) => {
		setSettings(prev => {
			const newSettings = { ...prev, [key]: !prev[key] };
			updateSettings(newSettings);
			return newSettings;
		});
	};

	return (
		<form className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Security Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="mfa">Multi-Factor Authentication</Label>
						<Switch
							id="mfa"
							checked={settings.mfaEnabled}
							onCheckedChange={() => handleToggle('mfaEnabled')}
							disabled={isPending}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="email">Email Notifications</Label>
						<Switch
							id="email"
							checked={settings.emailNotifications}
							onCheckedChange={() => handleToggle('emailNotifications')}
							disabled={isPending}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>System Maintenance</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="backup">Automatic Backup</Label>
						<Switch
							id="backup"
							checked={settings.autoBackup}
							onCheckedChange={() => handleToggle('autoBackup')}
							disabled={isPending}
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="maintenance">Maintenance Mode</Label>
						<Switch
							id="maintenance"
							checked={settings.maintenanceMode}
							onCheckedChange={() => handleToggle('maintenanceMode')}
							disabled={isPending}
						/>
					</div>
				</CardContent>
			</Card>
		</form>

	);
}