import { AcademicYearSettings } from "@/components/dashboard/roles/super-admin/settings/AcademicYearSettings";

export default function AcademicYearSettingsPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-2xl font-bold mb-6">Academic Year Configuration</h1>
			<AcademicYearSettings />
		</div>
	);
}