import { useState, useCallback } from "react";
import { VehicleService } from "../services/VehicleService";
import { UserService } from "../services/UserService";
import { VehicleUser } from "../interfaces/Vehicle";

export const useVehicleUsers = () => {
  const vehicleService = new VehicleService();
  const userService = new UserService();
  const [vehicleUsers, setVehicleUsers] = useState<VehicleUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usa VehicleService para obtener los usuarios asignados a un vehículo
  const fetchVehicleUsers = useCallback(async (vehicleId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await vehicleService.getVehicleUsers(vehicleId);
      setVehicleUsers(users);
      return users;
    } catch (err: any) {
      setError(err.message || "Error al obtener usuarios del vehículo");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // El resto puede seguir usando UserService si corresponde
  const assignUsers = async (userId: number, data: { vehicleIds: number[]; notes?: string; isActive?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.assignVehiclesToUser(userId, data);
      await fetchVehicleUsers(data.vehicleIds[0]);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al asignar vehículo");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (userId: number, vehicleId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.removeVehicleFromUser(userId, vehicleId);
      await fetchVehicleUsers(vehicleId);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al remover usuario");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicleUsers,
    isLoading,
    error,
    fetchVehicleUsers,
    assignUsers,
    removeUser,
  };
};

export default useVehicleUsers;