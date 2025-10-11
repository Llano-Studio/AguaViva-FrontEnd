import type { UserRole } from "../interfaces/User";

export const roleLabels: Record<UserRole, string> = {
  ADMINISTRATIVE: "Administrativo",
  SUPERADMIN: "Superadministrador",
  BOSSADMINISTRATIVE: "Jefe administrativo",
  DRIVERS: "Chofer",
};

export const renderRoleLabel = (value: UserRole | string) =>
  roleLabels[value as UserRole] ?? value;

// Opciones tipadas a UserRole, reutilizables en filtros/formularios
export type RoleOption = { label: string; value: UserRole };
export const ROLE_OPTIONS: RoleOption[] =
  (Object.entries(roleLabels) as [UserRole, string][])
    .map(([value, label]) => ({ label, value }));