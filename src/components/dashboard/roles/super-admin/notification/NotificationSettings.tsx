"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useToast } from "@/hooks/use-toast";

export const NotificationSettings = () => {
	const { toast } = useToast();
	const { data: settings, refetch } = api.notification.getSettings.useQuery();
	const updateSettings = api.notification.updateSettings.useMutation({
		onSuccess: () => {
			toast({ title: "Settings updated" });
			refetch();
		},
	});

	const [doNotDisturbEnabled, setDoNotDisturbEnabled] = useState(settings?.doNotDisturb || false);

	const handleToggle = (field: string, value: boolean) => {
		updateSettings.mutate({ [field]: value });
	};

	const handleDoNotDisturbTime = (start: Date | undefined, end: Date | undefined) => {
		updateSettings.mutate({
			doNotDisturb: doNotDisturbEnabled,
			doNotDisturbStart: start,
			doNotDisturbEnd: end,
		});
	};

	return (
		<Card className="p-6 space-y-6">
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Notification Preferences</h2>
				
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="emailNotifications">Email Notifications</Label>
						<Switch
							id="emailNotifications"
							checked={settings?.emailNotifications}
							onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="pushNotifications">Push Notifications</Label>
						<Switch
							id="pushNotifications"
							checked={settings?.pushNotifications}
							onCheckedChange={(checked) => handleToggle("pushNotifications", checked)}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-md font-medium">Update Types</h3>
					
					<div className="flex items-center justify-between">
						<Label htmlFor="timetableChanges">Timetable Changes</Label>
						<Switch
							id="timetableChanges"
							checked={settings?.timetableChanges}
							onCheckedChange={(checked) => handleToggle("timetableChanges", checked)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="assignmentUpdates">Assignment Updates</Label>
						<Switch
							id="assignmentUpdates"
							checked={settings?.assignmentUpdates}
							onCheckedChange={(checked) => handleToggle("assignmentUpdates", checked)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="gradeUpdates">Grade Updates</Label>
						<Switch
							id="gradeUpdates"
							checked={settings?.gradeUpdates}
							onCheckedChange={(checked) => handleToggle("gradeUpdates", checked)}
						/>
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="systemUpdates">System Updates</Label>
						<Switch
							id="systemUpdates"
							checked={settings?.systemUpdates}
							onCheckedChange={(checked) => handleToggle("systemUpdates", checked)}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-md font-medium">Do Not Disturb</h3>
					
					<div className="flex items-center justify-between">
						<Label htmlFor="doNotDisturb">Enable Do Not Disturb</Label>
						<Switch
							id="doNotDisturb"
							checked={doNotDisturbEnabled}
							onCheckedChange={setDoNotDisturbEnabled}
						/>
					</div>

					{doNotDisturbEnabled && (
						<div className="space-y-2">
							<div>
								<Label>Start Time</Label>
								<DateTimePicker
									value={settings?.doNotDisturbStart}
									onChange={(date) => handleDoNotDisturbTime(date, settings?.doNotDisturbEnd)}
								/>
							</div>
							<div>
								<Label>End Time</Label>
								<DateTimePicker
									value={settings?.doNotDisturbEnd}
									onChange={(date) => handleDoNotDisturbTime(settings?.doNotDisturbStart, date)}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};