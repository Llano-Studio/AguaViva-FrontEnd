import {
  Zone,
  Locality,
  ZonesResponse,
  Country,
  Province,
  CreateLocalityDTO,
  UpdateLocalityDTO,
  DeleteLocalityResponse,
} from "../interfaces/Locations";
import { httpAdapter } from "./httpAdapter";

export class LocationService {
  private zonesUrl = "/zones";
  private localitiesUrl = "/localities";
  private countriesUrl = "/countries";
  private provincesUrl = "/provinces";

  // ZONES
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

  // LOCALITIES
  async getLocalities(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<Locality[]> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<Locality[]>(this.localitiesUrl, { params: safeParams });
  }

  async getLocalityById(id: number): Promise<Locality | null> {
    try {
      return await httpAdapter.get<Locality>(`${this.localitiesUrl}/${id}`);
    } catch (error) {
      console.error("Error en getLocalityById:", error);
      return null;
    }
  }

  async createLocality(locality: CreateLocalityDTO): Promise<Locality> {
    try {
      return await httpAdapter.post<Locality>(locality, this.localitiesUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear localidad");
    }
  }

  async updateLocality(id: number, locality: Partial<UpdateLocalityDTO>): Promise<Locality | null> {
    try {
      return await httpAdapter.patch<Locality>(locality, `${this.localitiesUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar localidad");
    }
  }

  async deleteLocality(id: number): Promise<DeleteLocalityResponse> {
    try {
      return await httpAdapter.delete<DeleteLocalityResponse>(`${this.localitiesUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar localidad");
    }
  }

  // COUNTRIES
  async getCountries(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<Country[]> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<Country[]>(this.countriesUrl, { params: safeParams });
  }

  async getCountryById(id: number): Promise<Country | null> {
    try {
      return await httpAdapter.get<Country>(`${this.countriesUrl}/${id}`);
    } catch (error) {
      console.error("Error en getCountryById:", error);
      return null;
    }
  }

  // PROVINCES
  async getProvinces(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<Province[]> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<Province[]>(this.provincesUrl, { params: safeParams });
  }

  async getProvinceById(id: number): Promise<Province | null> {
    try {
      return await httpAdapter.get<Province>(`${this.provincesUrl}/${id}`);
    } catch (error) {
      console.error("Error en getProvinceById:", error);
      return null;
    }
  }

  // FILTROS ADICIONALES
  async getProvincesByCountry(countryId: number): Promise<Province[]> {
    try {
      return await httpAdapter.get<Province[]>(`${this.provincesUrl}?country_id=${countryId}`);
    } catch (error) {
      console.error("Error en getProvincesByCountry:", error);
      return [];
    }
  }

  async getLocalitiesByProvince(provinceId: number): Promise<Locality[]> {
    try {
      return await httpAdapter.get<Locality[]>(`${this.localitiesUrl}?province_id=${provinceId}`);
    } catch (error) {
      console.error("Error en getLocalitiesByProvince:", error);
      return [];
    }
  }

  async getLocalitiesByZone(zoneId: number): Promise<Locality[]> {
    try {
      return await httpAdapter.get<Locality[]>(`${this.localitiesUrl}?zone_id=${zoneId}`);
    } catch (error) {
      console.error("Error en getLocalitiesByZone:", error);
      return [];
    }
  }
}

export default LocationService;