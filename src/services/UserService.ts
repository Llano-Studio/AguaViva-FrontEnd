import { User, UsersResponse } from "../interfaces/User";
import { CreateUserDTO } from "../interfaces/User";
import { apiFetch } from "../utils/apiFetch";

export class UserService {
  private usersUrl = "/auth/users";
  private registerUrl = "/auth/register";

  // Ahora acepta parámetros de paginación, búsqueda y filtros dinámicos
async getUsers(params?: { page?: number; limit?: number; search?: string; [key: string]: any }): Promise<UsersResponse> {
  try {
    let query = "";
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", String(params.page));
      if (params.limit) searchParams.append("limit", String(params.limit));
      if (params.search) searchParams.append("search", params.search);

      Object.keys(params).forEach(key => {
        if (!["page", "limit", "search"].includes(key) && params[key] !== undefined && params[key] !== "") {
          const value = params[key];
          // Solo agrega el filtro si el array tiene al menos un valor
          if (Array.isArray(value)) {
            if (value.length > 0) {
              value.forEach(v => searchParams.append(key, v));
            }
          } else {
            searchParams.append(key, String(value));
          }
        }
      });

      query = `?${searchParams.toString()}`;
    }
    return await apiFetch<UsersResponse>(this.usersUrl + query);
  } catch (error) {
    console.error("Error en getUsers:", error);
    return {
      data: [],
      meta: {
        limit: 0,
        page: 0,
        total: 0,
        totalPages: 0,
      }
    }
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