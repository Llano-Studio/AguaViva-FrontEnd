import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { RoleService } from "../services/RoleService";

const roleService = new RoleService();

export const useModulesByRole = () => {
  const { user, isLoading } = useAuth();
  const [modules, setModules] = useState<string[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      if (user?.role) {
        try {
          setIsLoadingModules(true);
          const result = await roleService.getModulesByRole(user.role);
          setModules(result);
        } catch (error) {
          console.error("Error al obtener módulos por rol:", error);
        } finally {
          setIsLoadingModules(false);
        }
      } else {
        setIsLoadingModules(false);
      }
    };

    if (!isLoading && user) {
      fetchModules();
    }
  }, [user, isLoading]);

  return { modules, isLoadingModules };
};
