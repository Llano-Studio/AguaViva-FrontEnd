import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "../services/AuthService";
import { AuthContextType, User } from "../interfaces/AuthInterfaces";
// API_URL no es necesaria aquí si AuthService la maneja internamente

// AuthService se instancia sin argumentos, ya que toma API_URL internamente.
const authService = new AuthService();

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Verificación del token y el estado de la sesión al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken"); // Usar "accessToken"

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!isTokenExpired(storedToken)) {
          setUser(parsedUser);
        } else {
          logout(); // Si el token está expirado, hacer logout
        }
      } catch (error) {
        console.error("Error al parsear el usuario almacenado o token expirado:", error);
        logout(); // Limpiar en caso de error
      }
    }
  }, []);

  // Verificar si el JWT ha expirado
  const isTokenExpired = (token: string) => {
    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));
      const exp = decoded.exp * 1000;
      return exp < Date.now();
    } catch (e) {
      console.error("Error al decodificar el token:", e);
      return true; // Considerar el token como expirado si hay error en decodificación
    }
  };

  // Método de login
  const login = async (email: string, password: string): Promise<boolean> => {
    const loginResult = await authService.login(email, password);
    if (loginResult && loginResult.user && loginResult.accessToken) {
      setUser(loginResult.user);
      localStorage.setItem("user", JSON.stringify(loginResult.user));
      localStorage.setItem("accessToken", loginResult.accessToken); // Guardar "accessToken"
      return true;
    }
    // authService.login ya loguea el error si falla
    return false;
  };

  // Método de logout
  const logout = () => {
    authService.logout(); // AuthService se encarga de remover "accessToken"
    setUser(null);
    localStorage.removeItem("user");
    // localStorage.removeItem("accessToken") // Ya no es necesario aquí, AuthService.logout lo hace.
    console.log("Usuario deslogueado y datos locales limpiados en AuthContext.");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
