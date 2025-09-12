export interface PasswordRecoveryResponse {
  success: boolean;
  message?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface EmailConfirmationResponse {
  success: boolean;
  message?: string;
}

export interface IAuthService {
  login(email: string, password: string): Promise<any | null>;
  recoverPassword(email: string): Promise<PasswordRecoveryResponse>;
  resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse>;
  updatePassword?(currentPassword: string, newPassword: string): Promise<UpdatePasswordResponse>;
  confirmEmail(token: string): Promise<EmailConfirmationResponse>;
}