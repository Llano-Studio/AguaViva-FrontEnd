import { PasswordRecoveryResponse, ResetPasswordResponse } from "../services/AuthService";

export interface IAuthService {
  login(email: string, password: string): Promise<any | null>; // `any` es el tipo de retorno, puede ser el objeto de usuario o `null`
  recoverPassword(email: string): Promise<PasswordRecoveryResponse>; // Ahora usando el tipo importado
  resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse>; // Nuevo método para restablecer contraseña
}
