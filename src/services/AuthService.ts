import { API_URL } from "../config"; 
import { IAuthService } from "../interfaces/IAuthService";

export class AuthService implements IAuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_URL; 
  }

  // Implementación del login con JWT
  async login(email: string, password: string): Promise<{ user: any; accessToken: string } | null> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data && data.user && data.accessToken) {
        // Almacenamos el token JWT en localStorage
        localStorage.setItem("accessToken", data.accessToken);
        return { user: data.user, accessToken: data.accessToken };
      } else {
        console.error("Error en el login desde el servicio:", data?.message || "Respuesta no exitosa o datos incompletos");
        return null;
      }
    } catch (error) {
      console.error("Error al intentar iniciar sesión en el servicio:", error);
      return null;
    }
  }

  // Implementación del logout con eliminación del JWT
  async logout(): Promise<boolean> {
    try {
   
      localStorage.removeItem("accessToken");
      console.log("Token eliminado localmente. Sesión cerrada en AuthService.");
      return true;
    } catch (error) {
      console.error("Error al intentar cerrar sesión en AuthService:", error);
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
    return localStorage.getItem("accessToken");
  }

  // Método para verificar si el token JWT existe
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
