import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "../services/AuthService";
import { AuthContextType, User } from "../interfaces/AuthInterfaces";
import { AuthStorage } from "../utils/AuthStorage";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const authService = new AuthService();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = AuthStorage.getUser();
    const storedToken = AuthStorage.getToken();

    if (storedUser && storedToken && !isTokenExpired(storedToken)) {
      setUser(storedUser);
    } else {
      logout();
    }
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
    if (result && result.token && result.user) {
      setUser(result.user);
      AuthStorage.saveToken(result.token);
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
