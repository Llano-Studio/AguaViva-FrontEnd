import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Importamos el AuthContext

// Este hook facilita el acceso a los datos de autenticación desde el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log("context desde useAuth: ", context);

  // Verificamos si el contexto está disponible (es importante para evitar errores si se usa fuera del AuthProvider)
  if (!context) {
    console.log("no se encontro contexto en useContext: ", context);
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
};
