import { API_URL } from "../config";
import { User } from "../interfaces/User";
import { CreateUserDTO } from "../interfaces/User";


export class UserService {
  private usersUrl = `${API_URL}/api/auth/users`;
  private registerUrl = `${API_URL}/api/auth/register`;

  private getAuthHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(this.usersUrl, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error al obtener los usuarios");

      return await response.json();
    } catch (error) {
      console.error("Error en getUsers:", error);
      return [];
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${this.usersUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error al obtener el usuario");

      return await response.json();
    } catch (error) {
      console.error("Error en getUserById:", error);
      return null;
    }
  }

  async createUser(user: CreateUserDTO): Promise<User | null> {
    try {
      const response = await fetch(this.registerUrl, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error("Error al crear el usuario");

      return await response.json();
    } catch (error) {
      console.error("Error en createUser:", error);
      return null;
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.usersUrl}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error("Error al actualizar el usuario");

      return await response.json();
    } catch (error) {
      console.error("Error en updateUser:", error);
      return null;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.usersUrl}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error al eliminar el usuario");

      return true;
    } catch (error) {
      console.error("Error en deleteUser:", error);
      return false;
    }
  }
}
