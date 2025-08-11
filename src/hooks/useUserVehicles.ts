import { useState } from "react";
import { UserService } from "../services/UserService";

export const useUserVehicles = () => {
  const userService = new UserService();
  const [assignedVehicles, setAssignedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserVehicles = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const vehicles = await userService.getUserVehicles(userId);
      setAssignedVehicles(vehicles);
    } catch (err: any) {
      setError(err.message || "Error al obtener vehículos asignados");
    } finally {
      setLoading(false);
    }
  };

  const assignVehiclesToUser = async (userId: number, vehicleIds: number[], notes?: string, isActive?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await userService.assignVehiclesToUser(userId, { vehicleIds, notes, isActive });
      await fetchUserVehicles(userId);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al asignar vehículos");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeVehicleFromUser = async (userId: number, vehicleId: number) => {
    setLoading(true);
    setError(null);
    try {
      await userService.removeVehicleFromUser(userId, vehicleId);
      await fetchUserVehicles(userId);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al remover vehículo");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignedVehicles,
    loading,
    error,
    fetchUserVehicles,
    assignVehiclesToUser,
    removeVehicleFromUser,
  };
};

export default useUserVehicles;