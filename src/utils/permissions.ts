export const Permissions = {
  // User permissions
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  
  // Role permissions
  ROLE_CREATE: "role:create",
  ROLE_READ: "role:read",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  
  // Permission management
  PERMISSION_MANAGE: "permission:manage",
  
  // System settings
  SETTINGS_MANAGE: "settings:manage",

  // Academic Calendar permissions
  ACADEMIC_CALENDAR_VIEW: "academic-calendar:view",
  ACADEMIC_CALENDAR_MANAGE: "academic-calendar:manage",
  ACADEMIC_YEAR_MANAGE: "academic-year:manage",
  EVENT_MANAGE: "event:manage",

  // Program Management permissions
  PROGRAM_VIEW: "program:view",
  PROGRAM_MANAGE: "program:manage",
  PROGRAM_DELETE: "program:delete",

  // Class Group Management permissions
  CLASS_GROUP_VIEW: "class-group:view",
  CLASS_GROUP_MANAGE: "class-group:manage",
  CLASS_GROUP_DELETE: "class-group:delete",

  // Class Management permissions
  CLASS_VIEW: "class:view",
  CLASS_MANAGE: "class:manage",
  CLASS_DELETE: "class:delete",
  CLASS_ASSIGN_TEACHERS: "class:assign-teachers",
  CLASS_ASSIGN_STUDENTS: "class:assign-students",

  // Gradebook permissions
  GRADEBOOK_VIEW: "gradebook:view",
  GRADEBOOK_OVERVIEW: "gradebook:overview",
  GRADEBOOK_MANAGE: "gradebook:manage",
  GRADE_ACTIVITY: "grade:activity",
  GRADE_MODIFY: "grade:modify",

  // Subject Management permissions
  SUBJECT_VIEW: "subject:view",
  SUBJECT_MANAGE: "subject:manage",
  SUBJECT_DELETE: "subject:delete",
  SUBJECT_ASSIGN_TEACHERS: "subject:assign-teachers",
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

export const DefaultRoles = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  PROGRAM_COORDINATOR: "program_coordinator",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
} as const;

export type Role = typeof DefaultRoles[keyof typeof DefaultRoles];

export const RolePermissions: Record<Role, Permission[]> = {
  [DefaultRoles.SUPER_ADMIN]: [
    ...Object.values(Permissions),
  ],
  [DefaultRoles.ADMIN]: [
    Permissions.USER_CREATE,
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
    Permissions.ROLE_READ,
    Permissions.SETTINGS_MANAGE,
    Permissions.CLASS_GROUP_VIEW,
    Permissions.CLASS_GROUP_MANAGE,
    Permissions.GRADEBOOK_VIEW,
    Permissions.GRADEBOOK_OVERVIEW,
    Permissions.GRADEBOOK_MANAGE,
    Permissions.GRADE_ACTIVITY,
    Permissions.GRADE_MODIFY,
  ],
  [DefaultRoles.PROGRAM_COORDINATOR]: [
    Permissions.USER_READ,
    Permissions.USER_UPDATE,
    Permissions.CLASS_GROUP_VIEW,
    Permissions.CLASS_GROUP_MANAGE,
    Permissions.GRADEBOOK_VIEW,
    Permissions.GRADEBOOK_OVERVIEW,
    Permissions.GRADEBOOK_MANAGE,
    Permissions.GRADE_ACTIVITY,
  ],
  [DefaultRoles.TEACHER]: [
    Permissions.USER_READ,
    Permissions.CLASS_GROUP_VIEW,
    Permissions.GRADE_ACTIVITY,
    Permissions.GRADEBOOK_VIEW,
    Permissions.GRADEBOOK_OVERVIEW,
  ],
  [DefaultRoles.STUDENT]: [
    Permissions.USER_READ,
    Permissions.CLASS_GROUP_VIEW,
  ],
  [DefaultRoles.PARENT]: [
    Permissions.USER_READ,
  ],
};