import { API_URL } from "../config";
import {
  IAuthService,
  PasswordRecoveryResponse,
  ResetPasswordResponse,
  UpdatePasswordResponse,
  EmailConfirmationResponse,
} from "../interfaces/IAuthService";
import { httpAdapter } from "./httpAdapter";

export type {
  PasswordRecoveryResponse,
  ResetPasswordResponse,
  UpdatePasswordResponse,
  EmailConfirmationResponse,
};

export class AuthService implements IAuthService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_URL;
  }

  async login(email: string, password: string): Promise<{ user: any; accessToken: string } | null> {
    try {
      const response = await httpAdapter.post<{ user: any; accessToken: string }>(
        { email, password },
        "/auth/login"
      );
      if (response && response.user && response.accessToken) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      return null;
    }
  }

  async recoverPassword(email: string): Promise<PasswordRecoveryResponse> {
    try {
      const response = await httpAdapter.post<PasswordRecoveryResponse>(
        { email },
        "/auth/recover-password"
      );
      return { success: !!response.success, message: response.message };
    } catch (error: any) {
      console.error("Error al intentar recuperar la contraseña:", error);
      let errorMessage = "Error de red o servidor";
      if (error.message === "Failed to fetch") {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }
      return { success: false, message: errorMessage };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await httpAdapter.post<ResetPasswordResponse>(
        { token, password: newPassword },
        "/auth/reset-password"
      );
      return { success: !!response.success, message: response.message };
    } catch (error: any) {
      console.error("Error al intentar restablecer la contraseña:", error);
      let errorMessage = "Error de red o servidor";
      if (error.message === "Failed to fetch") {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }
      return { success: false, message: errorMessage };
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<UpdatePasswordResponse> {
    try {
      const response = await httpAdapter.post<UpdatePasswordResponse>(
        { currentPassword, newPassword },
        "/auth/update-password"
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.message || "Error al actualizar la contraseña.");
    }
  }

  async confirmEmail(token: string): Promise<EmailConfirmationResponse> {
    try {
      const response = await httpAdapter.post<EmailConfirmationResponse>(
        { token },
        "/auth/confirm-email"
      );
      return { success: !!response.success, message: response.message };
    } catch (error: any) {
      console.error("Error al confirmar el email:", error);
      let errorMessage = "Error de red o servidor";
      if (error.message === "Failed to fetch") {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }
      return { success: false, message: errorMessage };
    }
  }
}