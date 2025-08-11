import { apiFetch } from "../utils/apiFetch";

export class RoleService {
  async getModulesByRole(role: string): Promise<string[]> {
    try {
      return await apiFetch<string[]>(`/auth/roles/${role}/modules`);
    } catch (error) {
      console.error(`Error en getModulesByRole (${role}):`, error);
      return [];
    }
  }
}
