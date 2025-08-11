import { useMemo, useState, useCallback } from "react";
import { VehicleService } from "../services/VehicleService";

export const useVehicleAssignments = () => {
  const vehicleService = useMemo(() => new VehicleService(), []);
  const [assignedZones, setAssignedZones] = useState<any[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleZones = useCallback(async (vehicleId: number) => {
    setLoading(true);
    setError(null);
    try {
      const zones = await vehicleService.getVehicleZones(vehicleId);
      setAssignedZones(zones);
      return zones;
    } catch (err: any) {
      setError(err.message || "Error al obtener zonas asignadas");
      return [];
    } finally {
      setLoading(false);
    }
  }, [vehicleService]);

  const assignZonesToVehicle = useCallback(async (vehicleId: number, zoneIds: number[], notes?: string, isActive?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await vehicleService.assignZonesToVehicle(vehicleId, { zoneIds, notes, isActive });
      await fetchVehicleZones(vehicleId);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al asignar zonas");
      return false;
    } finally {
      setLoading(false);
    }
  }, [vehicleService, fetchVehicleZones]);

  const removeZoneFromVehicle = useCallback(async (vehicleId: number, zoneId: number) => {
    setLoading(true);
    setError(null);
    try {
      await vehicleService.removeZoneFromVehicle(vehicleId, zoneId);
      await fetchVehicleZones(vehicleId);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al remover zona");
      return false;
    } finally {
      setLoading(false);
    }
  }, [vehicleService, fetchVehicleZones]);

  const fetchVehicleUsers = useCallback(async (vehicleId: number) => {
    setLoading(true);
    setError(null);
    try {
      const users = await vehicleService.getVehicleUsers(vehicleId);
      setAssignedUsers(users);
      return users;
    } catch (err: any) {
      setError(err.message || "Error al obtener usuarios asignados");
      return [];
    } finally {
      setLoading(false);
    }
  }, [vehicleService]);

  return {
    assignedZones,
    assignedUsers,
    loading,
    error,
    fetchVehicleZones,
    assignZonesToVehicle,
    removeZoneFromVehicle,
    fetchVehicleUsers,
  };
};

export default useVehicleAssignments;