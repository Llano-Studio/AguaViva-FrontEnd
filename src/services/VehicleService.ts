import { Vehicle, CreateVehicleDTO, VehiclesResponse, VehicleZoneAssignment, VehicleUser } from "../interfaces/Vehicle";
import { httpAdapter } from "./httpAdapter";

export class VehicleService {
  private vehiclesUrl = "/vehicles";

  async getVehicles(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<VehiclesResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<VehiclesResponse>(this.vehiclesUrl, { params: safeParams });
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    try {
      return await httpAdapter.get<Vehicle>(`${this.vehiclesUrl}/${id}`);
    } catch (error) {
      console.error("Error en getVehicleById:", error);
      return null;
    }
  }

  async createVehicle(vehicle: CreateVehicleDTO): Promise<Vehicle | null> {
    try {
      return await httpAdapter.post<Vehicle>(vehicle, this.vehiclesUrl);
    } catch (error: any) {
      console.error("Error en createVehicle:", error);
      return null;
    }
  }

  async updateVehicle(id: number, vehicle: Partial<CreateVehicleDTO>): Promise<Vehicle | null> {
    try {
      return await httpAdapter.patch<Vehicle>(vehicle, `${this.vehiclesUrl}/${id}`);
    } catch (error) {
      console.error("Error en updateVehicle:", error);
      return null;
    }
  }

  async deleteVehicle(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.vehiclesUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deleteVehicle:", error);
      return false;
    }
  }

    // Asignar zonas a un vehículo
  async assignZonesToVehicle(id: number, payload: { zoneIds: number[]; notes?: string; isActive?: boolean }) {
    return await httpAdapter.post<VehicleZoneAssignment[]>(payload, `${this.vehiclesUrl}/${id}/zones`);
  }

  // Obtener zonas asignadas a un vehículo
  async getVehicleZones(id: number) {
    return await httpAdapter.get<VehicleZoneAssignment[]>(`${this.vehiclesUrl}/${id}/zones`);
  }

  // Remover zona de un vehículo
  async removeZoneFromVehicle(vehicleId: number, zoneId: number) {
    return await httpAdapter.delete(`${this.vehiclesUrl}/${vehicleId}/zones/${zoneId}`);
  }

  // Obtener usuarios que pueden manejar un vehículo
  async getVehicleUsers(id: number) {
    return await httpAdapter.get<VehicleUser[]>(`${this.vehiclesUrl}/${id}/users`);
  }
}