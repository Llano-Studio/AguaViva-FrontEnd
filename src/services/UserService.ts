import { User, UsersResponse } from "../interfaces/User";
import { CreateUserDTO } from "../interfaces/User";
import { httpAdapter } from "./httpAdapter";

export class UserService {
  private usersUrl = "/auth/users";
  private registerUrl = "/auth/register";

  async getUsers(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<UsersResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<UsersResponse>(this.usersUrl, { params: safeParams });
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      return await httpAdapter.get<User>(`${this.usersUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener usuario");
    }
  }

  async createUser(user: FormData, isFormData = false): Promise<User | null> {
    try {
      return await httpAdapter.post<User>(user, this.registerUrl, isFormData ? { isFormData: true } : undefined);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear usuario");
    }
  }

  async updateUser(id: number, user: Partial<User> | FormData, isFormData = false): Promise<User | null> {
    try {
      if (user instanceof FormData) {
        return await httpAdapter.put<User>(user, `${this.usersUrl}/${id}`, isFormData ? { isFormData: true } : undefined);
      } else {
        const filteredUser = {
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        };
        return await httpAdapter.put<User>(filteredUser, `${this.usersUrl}/${id}`);
      }
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar usuario");
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.usersUrl}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar usuario");
    }
  }

  // Asignar vehículos a un usuario
  async assignVehiclesToUser(id: number, payload: { vehicleIds: number[]; notes?: string; isActive?: boolean }) {
    return await httpAdapter.post<any[]>(payload, `/auth/users/${id}/vehicles`);
  }

  // Obtener vehículos asignados a un usuario
  async getUserVehicles(id: number) {
    return await httpAdapter.get<any[]>(`/auth/users/${id}/vehicles`);
  }

  // Remover vehículo de un usuario
  async removeVehicleFromUser(userId: number, vehicleId: number) {
    return await httpAdapter.delete(`/auth/users/${userId}/vehicles/${vehicleId}`);
  }
}