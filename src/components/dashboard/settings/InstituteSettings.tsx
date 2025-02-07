"use client";

import { useState, useEffect } from "react";
import type { TimeZone, InstituteSettingsType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";

export function InstituteSettings() {
	const [settings, setSettings] = useState<InstituteSettingsType>({
		name: "",
		address: "",
		phone: "",
		email: "",
		website: "",
		timezone: "UTC",
		academicYearStart: new Date(),
		academicYearEnd: new Date(),
		id: 0,
		logo: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	const { toast } = useToast();
	const utils = api.useContext();

	const { data: instituteSettings } = api.settings.getInstituteSettings.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (instituteSettings && instituteSettings.id !== settings.id) {
			setSettings({
				...instituteSettings,
				academicYearStart: new Date(instituteSettings.academicYearStart),
				academicYearEnd: new Date(instituteSettings.academicYearEnd),
				website: instituteSettings.website ?? "",
				timezone: instituteSettings.timezone as TimeZone,
			});
		}
	}, [instituteSettings, settings.id]);




	const updateSettings = api.settings.updateInstituteSettings.useMutation({
		onSuccess: () => {
			toast({
				title: "Settings updated",
				description: "Institute settings have been updated successfully.",
			});
			utils.settings.getInstituteSettings.invalidate();
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const dataToSubmit = {
			name: settings.name,
			address: settings.address,
			phone: settings.phone,
			email: settings.email,
			website: settings.website || undefined,
			timezone: settings.timezone,
			academicYearStart: settings.academicYearStart.toISOString(),
			academicYearEnd: settings.academicYearEnd.toISOString(),
		};
		await updateSettings.mutateAsync(dataToSubmit);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Institute Name</Label>
							<Input
								id="name"
								value={settings.name}
								onChange={(e) => setSettings({ ...settings, name: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								value={settings.address}
								onChange={(e) => setSettings({ ...settings, address: e.target.value })}
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									value={settings.phone}
									onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={settings.email}
									onChange={(e) => setSettings({ ...settings, email: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="website">Website</Label>
							<Input
								id="website"
								type="url"
								value={settings.website ?? ""}
								onChange={(e) => setSettings({ ...settings, website: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="timezone">Timezone</Label>
							<Select
								value={settings.timezone}
								onValueChange={(value: TimeZone) => setSettings({ ...settings, timezone: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select timezone" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="UTC">UTC</SelectItem>
									<SelectItem value="GMT">GMT</SelectItem>
									<SelectItem value="EST">EST</SelectItem>
									<SelectItem value="PST">PST</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Academic Year</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="academicYearStart">Start Date</Label>
								<Input
									id="academicYearStart"
									type="date"
									value={settings.academicYearStart.toISOString().split('T')[0]}
									onChange={(e) => setSettings({ ...settings, academicYearStart: new Date(e.target.value) })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="academicYearEnd">End Date</Label>
								<Input
									id="academicYearEnd"
									type="date"
									value={settings.academicYearEnd.toISOString().split('T')[0]}
									onChange={(e) => setSettings({ ...settings, academicYearEnd: new Date(e.target.value) })}
									required
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Button type="submit" className="w-full">
					Save Changes
				</Button>
			</div>
		</form>
	);
}