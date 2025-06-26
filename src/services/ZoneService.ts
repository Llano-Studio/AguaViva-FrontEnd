import { Zone, ZonesResponse } from "../interfaces/Locations";
import { httpAdapter } from "./httpAdapter";

export interface CreateZoneDTO {
  name: string;
  code: string;
  localityId: number;
}

export class ZoneService {
  private zonesUrl = "/zones";

  async getZones(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<ZonesResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<ZonesResponse>(this.zonesUrl, { params: safeParams });
  }

  async getZoneById(id: number): Promise<Zone | null> {
    try {
      return await httpAdapter.get<Zone>(`${this.zonesUrl}/${id}`);
    } catch (error) {
      console.error("Error en getZoneById:", error);
      return null;
    }
  }

  async createZone(zone: CreateZoneDTO): Promise<Zone | null> {
    try {
      return await httpAdapter.post<Zone>(zone, this.zonesUrl);
    } catch (error: any) {
      console.error("Error en createZone:", error);
      return null;
    }
  }

  async updateZone(id: number, zone: Partial<CreateZoneDTO>): Promise<Zone | null> {
    try {
      return await httpAdapter.patch<Zone>(zone, `${this.zonesUrl}/${id}`);
    } catch (error) {
      console.error("Error en updateZone:", error);
      return null;
    }
  }

  async deleteZone(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.zonesUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deleteZone:", error);
      return false;
    }
  }

  async getZoneVehicles(id: number) {
    try {
      return await httpAdapter.get<any[]>(`${this.zonesUrl}/${id}/vehicles`);
    } catch (error) {
      console.error("Error en getZoneVehicles:", error);
      return [];
    }
  }
}