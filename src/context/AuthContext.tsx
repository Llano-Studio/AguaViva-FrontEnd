import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "../services/AuthService";
import { AuthContextType, AuthUser } from "../interfaces/AuthInterfaces";
import { AuthStorage } from "../utils/AuthStorage";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const authService = new AuthService();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = AuthStorage.getUser();
    const storedToken = AuthStorage.getToken();

    // Verificamos que el usuario y el token existen y que el token no haya expirado
    if (storedUser && storedToken && !isTokenExpired(storedToken)) {
      setUser(storedUser); // Aquí guardamos el usuario con la propiedad 'role'
    } else {
      logout();
    }

    setIsLoading(false);
  }, []);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));
      const exp = decoded.exp * 1000;
      return exp < Date.now();
    } catch (e) {
      return true;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    console.log("Resultado del login: ", result);
    if (result && result.accessToken && result.user) {
      setUser(result.user); // Aquí guardamos el usuario que tiene la propiedad 'role'
      AuthStorage.saveToken(result.accessToken);
      AuthStorage.saveUser(result.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    AuthStorage.removeToken();
    AuthStorage.removeUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
