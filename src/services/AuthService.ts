import { API_URL } from "../config"; // Importamos la URL de la API desde config.ts
import { IAuthService } from "../interfaces/IAuthService";

export class AuthService implements IAuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_URL; // Usamos la URL de la API centralizada
  }

  // Implementación del login con JWT
  async login(email: string, password: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data && data.token) {
        // Almacenamos el token JWT en localStorage
        localStorage.setItem("token", data.token);
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      return null;
    }
  }

  // Implementación del logout con eliminación del JWT
  async logout(): Promise<boolean> {
    try {
      // Hacemos una solicitud de logout (puede o no ser necesario según tu API)
      const response = await fetch(`${this.apiUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`, // Añadimos el token JWT en el header
        },
        body: JSON.stringify({ message: "Cerrar sesión" }),
      });

      const data = await response.json();

      if (data.success) {
        // Eliminamos el token JWT del localStorage
        localStorage.removeItem("token");
        console.log("Sesión cerrada correctamente");
        return true;
      }

      console.error("Error al cerrar sesión en la API");
      return false;
    } catch (error) {
      console.error("Error al intentar cerrar sesión:", error);
      return false;
    }
  }

  // Implementación de la recuperación de contraseña
  async recoverPassword(email: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.apiUrl}/recover-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error("Error al intentar recuperar la contraseña:", error);
      return { success: false };
    }
  }

  // Método para obtener el token JWT almacenado
  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Método para verificar si el token JWT existe
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
