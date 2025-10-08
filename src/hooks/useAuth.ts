import { useContext, useMemo, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType, AuthUser } from "../interfaces/AuthInterfaces";
import { AuthService } from "../services/AuthService";

// API expuesta por AuthService
export type AuthApi = {
  login: (email: string, password: string) => ReturnType<AuthService["login"]>;
  getProfile: () => ReturnType<AuthService["getProfile"]>;
  recoverPassword: (email: string) => ReturnType<AuthService["recoverPassword"]>;
  resetPassword: (token: string, newPassword: string) => ReturnType<AuthService["resetPassword"]>;
  updatePassword: (currentPassword: string, newPassword: string) => ReturnType<AuthService["updatePassword"]>;
  confirmEmail: (token: string) => ReturnType<AuthService["confirmEmail"]>;
};

// Tipado laxo para permitir desestructurar `login` desde el contexto sin cambiar el sistema
type WithLogin<T> = T & { login?: any };

export type UseAuthReturn = WithLogin<AuthContextType> & {
  authApi: AuthApi;
  currentUser: AuthUser | null; // alias para compatibilidad
};

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext); // tipo: AuthContextType | undefined
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  // Instancia estable del servicio
  const serviceRef = useRef(new AuthService());

  // Exponer todos los servicios de AuthService desde el hook
  const authApi: AuthApi = useMemo(() => {
    const svc = serviceRef.current;
    return {
      login: (email: string, password: string) => svc.login(email, password),
      getProfile: () => svc.getProfile(),
      recoverPassword: (email: string) => svc.recoverPassword(email),
      resetPassword: (token: string, newPassword: string) => svc.resetPassword(token, newPassword),
      updatePassword: (currentPassword: string, newPassword: string) =>
        svc.updatePassword(currentPassword, newPassword),
      confirmEmail: (token: string) => svc.confirmEmail(token),
    };
  }, []);

  // Devolvemos también currentUser como alias de context.user
  return { ...context, currentUser: context.user, authApi };
};