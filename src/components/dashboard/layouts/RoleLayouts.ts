import { DefaultRoles } from "@/utils/permissions";
import { SystemMetrics } from "../SystemMetrics";
import { DashboardLayoutConfig } from "@/types/dashboard";

// Import your dashboard components here
const components = {
	SystemMetrics,
	// Add other components as needed
};

export const RoleLayouts: Record<keyof typeof DefaultRoles, DashboardLayoutConfig> = {
	"SUPER_ADMIN": {
		type: "complex",
		components: [
			{
				component: SystemMetrics,
				gridArea: "metrics",
				className: "col-span-full"
			}
		]
	},
	"ADMIN": {
		type: "simple",
		components: [
			{
				component: SystemMetrics,
				gridArea: "metrics",
				className: "col-span-full"
			}
		]
	},
	"PROGRAM_COORDINATOR": {
		type: "simple",
		components: []
	},
	"TEACHER": {
		type: "simple",
		components: []
	},
	"STUDENT": {
		type: "simple",
		components: []
	},
	"PARENT": {
		type: "simple",
		components: []
	}
};