import { useState, useCallback } from "react";
import { VehicleZonesService, AssignZonesDTO, VehicleZone } from "../services/VehicleZonesService";

export const useVehicleZones = () => {
  const service = new VehicleZonesService();
  const [vehicleZones, setVehicleZones] = useState<VehicleZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleZones = useCallback(async (vehicleId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const zones = await service.getVehicleZones(vehicleId);
      setVehicleZones(zones);
      return zones;
    } catch (err: any) {
      setError(err.message || "Error al obtener zonas del vehículo");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignZones = async (vehicleId: number, data: AssignZonesDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await service.assignZones(vehicleId, data);
      await fetchVehicleZones(vehicleId);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al asignar zonas");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeZone = async (vehicleId: number, zoneId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await service.removeZone(vehicleId, zoneId);
      await fetchVehicleZones(vehicleId);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al remover zona");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicleZones,
    isLoading,
    error,
    fetchVehicleZones,
    assignZones,
    removeZone,
  };
};

export default useVehicleZones;