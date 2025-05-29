import { User, UsersResponse } from "../interfaces/User";
import { CreateUserDTO } from "../interfaces/User";
import { httpAdapter } from "./httpAdapter";

export class UserService {
  private usersUrl = "/auth/users";
  private registerUrl = "/auth/register";

  async getUsers(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<UsersResponse> {
    return await httpAdapter.get<UsersResponse>(this.usersUrl, { params });
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      return await httpAdapter.get<User>(`${this.usersUrl}/${id}`);
    } catch (error) {
      console.error("Error en getUserById:", error);
      return null;
    }
  }

  async createUser(user: CreateUserDTO): Promise<User | null> {
    try {
      return await httpAdapter.post<User>(user, this.registerUrl);
    } catch (error) {
      console.error("Error en createUser:", error);
      return null;
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    try {
      const filteredUser = {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      };
      return await httpAdapter.put<User>(filteredUser, `${this.usersUrl}/${id}`);
    } catch (error) {
      console.error("Error en updateUser:", error);
      return null;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.usersUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deleteUser:", error);
      return false;
    }
  }
}