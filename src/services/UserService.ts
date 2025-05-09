import { User } from "../interfaces/User";
import { CreateUserDTO } from "../interfaces/User";
import { apiFetch } from "../utils/apiFetch";

export class UserService {
  private usersUrl = "/api/auth/users";
  private registerUrl = "/api/auth/register";

  async getUsers(): Promise<User[]> {
    try {
      return await apiFetch<User[]>(this.usersUrl);
    } catch (error) {
      console.error("Error en getUsers:", error);
      return [];
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      return await apiFetch<User>(`${this.usersUrl}/${id}`);
    } catch (error) {
      console.error("Error en getUserById:", error);
      return null;
    }
  }

  async createUser(user: CreateUserDTO): Promise<User | null> {
    try {
      return await apiFetch<User>(this.registerUrl, {
        method: "POST",
        body: JSON.stringify(user),
      });
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

      console.log("Body PUT updateUser: ", filteredUser);

      return await apiFetch<User>(`${this.usersUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify(filteredUser),
      });
    } catch (error) {
      console.error("Error en updateUser:", error);
      return null;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await apiFetch(`${this.usersUrl}/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error en deleteUser:", error);
      return false;
    }
  }
}
