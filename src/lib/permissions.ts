// Central permission definition module.
// Frontend enforcement is NOT a substitute for secure RLS policies in the database.
// This module just standardizes capability checks in the UI/DataService.

export type UserRole = 'admin' | 'professor' | 'pai' | '';

export interface PermissionMatrixEntry {
  canViewAllUsers: boolean;
  canViewAllStudents: boolean;
  canViewAllClasses: boolean;
  canViewAllSubjects: boolean;
  canViewAllGrades: boolean;
  canViewAllMaterials: boolean;
  canViewAllMessages: boolean;
  canViewAllAttendance: boolean;
  canCreateUsers: boolean;
  canCreateStudents: boolean;
  canCreateClasses: boolean;
  canCreateSubjects: boolean;
  canCreateGrades: boolean;
  canCreateMaterials: boolean;
  canCreateMessages: boolean;
  canEditUsers: boolean;
  canEditStudents: boolean;
  canEditClasses: boolean;
  canEditSubjects: boolean;
  canDeleteUsers: boolean;
  canDeleteStudents: boolean;
  canDeleteClasses: boolean;
  canDeleteSubjects: boolean;
}

const base: PermissionMatrixEntry = {
  canViewAllUsers: false,
  canViewAllStudents: false,
  canViewAllClasses: false,
  canViewAllSubjects: false,
  canViewAllGrades: false,
  canViewAllMaterials: false,
  canViewAllMessages: false,
  canViewAllAttendance: false,
  canCreateUsers: false,
  canCreateStudents: false,
  canCreateClasses: false,
  canCreateSubjects: false,
  canCreateGrades: false,
  canCreateMaterials: false,
  canCreateMessages: false,
  canEditUsers: false,
  canEditStudents: false,
  canEditClasses: false,
  canEditSubjects: false,
  canDeleteUsers: false,
  canDeleteStudents: false,
  canDeleteClasses: false,
  canDeleteSubjects: false
};

const matrix: Record<UserRole, PermissionMatrixEntry> = {
  '': base,
  admin: {
    ...base,
    canViewAllUsers: true,
    canViewAllStudents: true,
    canViewAllClasses: true,
    canViewAllSubjects: true,
    canViewAllGrades: true,
    canViewAllMaterials: true,
    canViewAllMessages: true,
    canViewAllAttendance: true,
    canCreateUsers: true,
    canCreateStudents: true,
    canCreateClasses: true,
    canCreateSubjects: true,
    canCreateGrades: true,
    canCreateMaterials: true,
    canCreateMessages: true,
    canEditUsers: true,
    canEditStudents: true,
    canEditClasses: true,
    canEditSubjects: true,
    canDeleteUsers: true,
    canDeleteStudents: true,
    canDeleteClasses: true,
    canDeleteSubjects: true,
  },
  professor: {
    ...base,
    canCreateGrades: true,
    canCreateMaterials: true,
    canCreateMessages: true,
  },
  pai: base
};

export const getPermissionsForRole = (role: UserRole): PermissionMatrixEntry => matrix[role] || base;
