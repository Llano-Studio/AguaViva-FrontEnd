import { API_URL } from "../config";
import { IAuthService } from "../interfaces/IAuthService";

export interface PasswordRecoveryResponse {
  success: boolean;
  message?: string;
}

export class AuthService implements IAuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_URL;
  }

  async login(email: string, password: string): Promise<{ user: any; accessToken: string } | null>  {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok && data && data.user && data.accessToken) {
        return data;
      }

      return null;
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      return null;
    }
  }

  async recoverPassword(email: string): Promise<PasswordRecoveryResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/recover-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return { success: !!data.success, message: data.message };
      
    } catch (error: any) {
      console.error("Error al intentar recuperar la contraseña:", error);
      let errorMessage = "Error de red o servidor";
      if (error.message === "Failed to fetch") {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }
      return { success: false, message: errorMessage };
    }
  }
}
