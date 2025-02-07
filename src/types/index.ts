export type TimeZone = "UTC" | "GMT" | "EST" | "PST";

export interface InstituteSettingsType {
	name: string;
	address: string;
	phone: string;
	email: string;
	website: string | null;
	timezone: TimeZone;
	academicYearStart: Date;
	academicYearEnd: Date;
	id: number;
	logo: string | null;
	createdAt: Date;
	updatedAt: Date;
}