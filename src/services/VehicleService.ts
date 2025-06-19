import { Vehicle, CreateVehicleDTO, VehiclesResponse } from "../interfaces/Vehicle";
import { httpAdapter } from "./httpAdapter";

export class VehicleService {
  private vehiclesUrl = "/vehicles";

  async getVehicles(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<VehiclesResponse> {
    return await httpAdapter.get<VehiclesResponse>(this.vehiclesUrl, { params });
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
}