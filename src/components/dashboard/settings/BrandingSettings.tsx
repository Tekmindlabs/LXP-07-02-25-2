"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/utils/api";

interface BrandKitConfig {
	logo: {
		main: string;
		favicon: string;
		darkMode?: string;
	};
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		background: string;
		text: string;
	};
	typography: {
		headingFont: string;
		bodyFont: string;
		fontSize: {
			base: string;
			heading: string;
		};
	};
	spacing: {
		containerPadding: string;
		elementSpacing: string;
	};
	borderRadius: string;
}

export function BrandingSettings() {
	const { theme } = useTheme();
	const { toast } = useToast();
	const utils = api.useContext();

	const [brandKit, setBrandKit] = useState<BrandKitConfig>({
		logo: {
			main: "",
			favicon: "",
			darkMode: "",
		},
		colors: {
			primary: "#007AFF",
			secondary: "#6C757D",
			accent: "#28A745",
			background: "#FFFFFF",
			text: "#212529",
		},
		typography: {
			headingFont: "Inter",
			bodyFont: "Inter",
			fontSize: {
				base: "16px",
				heading: "24px",
			},
		},
		spacing: {
			containerPadding: "1rem",
			elementSpacing: "0.5rem",
		},
		borderRadius: "0.375rem",
	});

	const { mutate: updateBrandKit, isPending } = api.settings.updateBrandKit.useMutation({
		onSuccess: () => {
			toast({
				title: "Brand Kit Updated",
				description: "Your brand settings have been saved successfully.",
			});
			applyBrandKitStyles();
			utils.settings.getBrandKit.invalidate();
		},
	});

	const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: keyof typeof brandKit.logo) => {
		const file = event.target.files?.[0];
		if (file) {
			// TODO: Implement file upload logic
			const url = URL.createObjectURL(file);
			setBrandKit(prev => ({
				...prev,
				logo: { ...prev.logo, [type]: url }
			}));
		}
	};

	const applyBrandKitStyles = () => {
		const style = document.createElement('style');
		style.innerHTML = `
			:root {
				--primary: ${brandKit.colors.primary};
				--secondary: ${brandKit.colors.secondary};
				--accent: ${brandKit.colors.accent};
				--background: ${brandKit.colors.background};
				--text: ${brandKit.colors.text};
				--heading-font: ${brandKit.typography.headingFont};
				--body-font: ${brandKit.typography.bodyFont};
				--base-font-size: ${brandKit.typography.fontSize.base};
				--heading-font-size: ${brandKit.typography.fontSize.heading};
				--container-padding: ${brandKit.spacing.containerPadding};
				--element-spacing: ${brandKit.spacing.elementSpacing};
				--border-radius: ${brandKit.borderRadius};
			}
		`;
		document.head.appendChild(style);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateBrandKit(brandKit);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Logo Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label>Main Logo</Label>
							<Input 
								type="file" 
								accept="image/*"
								onChange={(e) => handleLogoUpload(e, 'main')}
							/>
						</div>
						<div>
							<Label>Dark Mode Logo</Label>
							<Input 
								type="file" 
								accept="image/*"
								onChange={(e) => handleLogoUpload(e, 'darkMode')}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Color Scheme</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{Object.entries(brandKit.colors).map(([key, value]) => (
							<div key={key}>
								<Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
								<ColorPicker
									value={value}
									onChange={(color) => 
										setBrandKit(prev => ({
											...prev,
											colors: { ...prev.colors, [key]: color }
										}))
									}
								/>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Typography</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label>Heading Font</Label>
							<Input
								value={brandKit.typography.headingFont}
								onChange={(e) =>
									setBrandKit(prev => ({
										...prev,
										typography: { ...prev.typography, headingFont: e.target.value }
									}))
								}
							/>
						</div>
						<div>
							<Label>Body Font</Label>
							<Input
								value={brandKit.typography.bodyFont}
								onChange={(e) =>
									setBrandKit(prev => ({
										...prev,
										typography: { ...prev.typography, bodyFont: e.target.value }
									}))
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Layout & Spacing</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label>Container Padding</Label>
							<Input
								value={brandKit.spacing.containerPadding}
								onChange={(e) =>
									setBrandKit(prev => ({
										...prev,
										spacing: { ...prev.spacing, containerPadding: e.target.value }
									}))
								}
							/>
						</div>
						<div>
							<Label>Border Radius</Label>
							<Input
								value={brandKit.borderRadius}
								onChange={(e) =>
									setBrandKit(prev => ({
										...prev,
										borderRadius: e.target.value
									}))
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Button 
				type="submit" 
				className="w-full"
				disabled={isPending}
			>
				{isPending ? "Saving..." : "Save Brand Kit"}
			</Button>
		</form>
	);
}