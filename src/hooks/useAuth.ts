import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log("context desde useAuth: ", context);

  if (!context) {
    console.log("no se encontro contexto en useContext: ", context);
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
};
