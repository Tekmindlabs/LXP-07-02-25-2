import { DefaultRoles } from "@/utils/permissions";

export type DashboardFeature =
  | 'system-metrics'
  | 'user-management'
  | 'role-management'
  | 'audit-logs'
  | 'advanced-settings'
  | 'class-management'
  | 'student-progress'
  | 'assignments'
  | 'grading'
  | 'academic-calendar'
  | 'timetable-management'
  | 'classroom-management'
  | 'class-activity-management'
  | 'knowledge-base';

export interface DashboardComponent {
  component: React.ComponentType<any>;
  gridArea?: string;
  className?: string;
}

export interface DashboardLayoutConfig {
  type: 'complex' | 'simple';
  components: DashboardComponent[];
}

export type DashboardLayoutType = Record<keyof typeof DefaultRoles, DashboardLayoutConfig>;