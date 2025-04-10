import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "../services/AuthService";
import { AuthContextType, User } from "../interfaces/AuthInterfaces";
import { API_URL } from "../config";  // Importar la URL de la API desde config.ts

// Usamos la URL de la API configurada
const authService = new AuthService(API_URL);

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Verificación del token y el estado de la sesión al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      if (!isTokenExpired(storedToken)) {
        setUser(JSON.parse(storedUser));
      } else {
        logout(); // Si el token está expirado, hacer logout
      }
    }
  }, []);

  // Verificar si el JWT ha expirado
  const isTokenExpired = (token: string) => {
    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1])); // Decodifica el token JWT
      const exp = decoded.exp * 1000; // La fecha de expiración del token
      return exp < Date.now(); // Retorna true si el token ha expirado
    } catch (e) {
      return true;
    }
  };

  // Método de login
  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    if (result && result.success && result.user && result.token) {
      setUser(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("token", result.token); // Guardamos el token JWT
      return true;
    }
    return false;
  };

  // Método de logout
  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Eliminamos el token JWT
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
