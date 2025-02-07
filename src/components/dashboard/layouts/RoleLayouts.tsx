import { DashboardLayout } from "@/types/dashboard";
import { DefaultRoles } from "@/utils/permissions";
import { AcademicCalendarView } from "@/components/dashboard/roles/super-admin/academic-calendar/AcademicCalendarView";

export const RoleLayouts: Record<keyof typeof DefaultRoles, DashboardLayout> = {
  "SUPER_ADMIN": {
    type: "complex",
    components: [
      {
        component: AcademicCalendarView,
        span: "col-span-4",
        props: {}
      }
    ]
  },
  "ADMIN": {
    type: "simple",
    components: []
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