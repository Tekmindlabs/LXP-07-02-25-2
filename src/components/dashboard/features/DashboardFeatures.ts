import { DefaultRoles } from "@/utils/permissions";
import { DashboardFeature } from "@/types/dashboard";

export const DashboardFeatures: Record<keyof typeof DefaultRoles, DashboardFeature[]> = {
  [DefaultRoles.SUPER_ADMIN]: [
    'system-metrics',
    'user-management',
    'role-management',
    'audit-logs',
    'advanced-settings',
    'academic-calendar',
    'timetable-management',
    'classroom-management',
    'class-activity-management',
    'knowledge-base'
  ],
  [DefaultRoles.ADMIN]: [
    'user-management',
    'audit-logs',
    'timetable-management',
    'classroom-management',
    'class-activity-management',
    'knowledge-base'
  ],
  [DefaultRoles.PROGRAM_COORDINATOR]: [
    'class-management',
    'student-progress',
    'timetable-management',
    'class-activity-management',
    'knowledge-base'
  ],
  [DefaultRoles.TEACHER]: [
    'class-management',
    'student-progress',
    'assignments',
    'grading',
    'class-activity-management',
    'knowledge-base'
  ],
  [DefaultRoles.STUDENT]: [
    'assignments',
    'student-progress',
    'class-activities',
    'knowledge-base'
  ],
  [DefaultRoles.PARENT]: [
    'student-progress',
    'class-activities'
  ]
};