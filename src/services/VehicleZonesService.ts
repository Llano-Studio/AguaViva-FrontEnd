import { httpAdapter } from "./httpAdapter";

export interface AssignZonesDTO {
  zoneIds: number[];
  notes?: string;
  isActive: boolean;
}

export interface VehicleZone {
  vehicle_zone_id: number;
  vehicle_id: number;
  zone_id: number;
  assigned_at: string;
  is_active: boolean;
  notes?: string;
  zone: any; // Puedes reemplazar 'any' por tu interfaz Zone si la tienes
}

export class VehicleZonesService {
  private baseUrl = "/vehicles";

  async assignZones(vehicleId: number, data: AssignZonesDTO): Promise<VehicleZone[]> {
    return await httpAdapter.post<VehicleZone[]>(data, `${this.baseUrl}/${vehicleId}/zones`);
  }

  async getVehicleZones(vehicleId: number): Promise<VehicleZone[]> {
    return await httpAdapter.get<VehicleZone[]>(`${this.baseUrl}/${vehicleId}/zones`);
  }

  async removeZone(vehicleId: number, zoneId: number): Promise<{ message: string; removed: boolean }> {
    return await httpAdapter.delete<{ message: string; removed: boolean }>(`${this.baseUrl}/${vehicleId}/zones/${zoneId}`);
  }
}