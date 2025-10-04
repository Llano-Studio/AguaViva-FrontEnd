import type { User, UserRole } from "../interfaces/User";

export type RoleMap = Record<UserRole, boolean>;

// Mapa booleans por rol para usar: isRole.SUPERADMIN || isRole.BOSSADMINISTRATIVE
export function buildIsRole(role?: UserRole | null): RoleMap {
  return {
    ADMINISTRATIVE: role === "ADMINISTRATIVE",
    SUPERADMIN: role === "SUPERADMIN",
    BOSSADMINISTRATIVE: role === "BOSSADMINISTRATIVE",
    DRIVERS: role === "DRIVERS",
  };
}