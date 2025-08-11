import { httpAdapter } from "./httpAdapter";
import { Zone, Locality, ZonesResponse, Country, Province } from "../interfaces/Locations";

export class LocationService {
  private zonesUrl = "/zones";
  private localitiesUrl = "/localities";
  private countriesUrl = "/countries";
  private provincesUrl = "/provinces";

  // ============ ZONES ============
  
  async getZones(): Promise<Zone[]> {
    try {
      const response = await httpAdapter.get<ZonesResponse>(this.zonesUrl);
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener zonas:", error);
      return [];
    }
  }

  // ============ LOCALITIES ============
  
  async getLocalities(): Promise<Locality[]> {
    try {
      const response = await httpAdapter.get<Locality[]>(this.localitiesUrl);
      return response || [];
    } catch (error) {
      console.error("Error al obtener localidades:", error);
      return [];
    }
  }

  /**
   * Obtiene una localidad por ID
   * @param id ID de la localidad
   * @returns Promise<Locality | null>
   */
  async getLocalityById(id: number): Promise<Locality | null> {
    try {
      const response = await httpAdapter.get<Locality>(`${this.localitiesUrl}/${id}`);
      return response || null;
    } catch (error) {
      console.error("Error al obtener localidad:", error);
      return null;
    }
  }

  // ============ COUNTRIES ============
  
  async getCountries(): Promise<Country[]> {
    try {
      const response = await httpAdapter.get<Country[]>(this.countriesUrl);
      return response || [];
    } catch (error) {
      console.error("Error al obtener países:", error);
      return [];
    }
  }

  /**
   * Obtiene un país por ID
   * @param id ID del país
   * @returns Promise<Country | null>
   */
  async getCountryById(id: number): Promise<Country | null> {
    try {
      const response = await httpAdapter.get<Country>(`${this.countriesUrl}/${id}`);
      return response || null;
    } catch (error) {
      console.error("Error al obtener país:", error);
      return null;
    }
  }

  // ============ PROVINCES ============
  
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await httpAdapter.get<Province[]>(this.provincesUrl);
      return response || [];
    } catch (error) {
      console.error("Error al obtener provincias:", error);
      return [];
    }
  }

  /**
   * Obtiene una provincia por ID
   * @param id ID de la provincia
   * @returns Promise<Province | null>
   */
  async getProvinceById(id: number): Promise<Province | null> {
    try {
      const response = await httpAdapter.get<Province>(`${this.provincesUrl}/${id}`);
      return response || null;
    } catch (error) {
      console.error("Error al obtener provincia:", error);
      return null;
    }
  }

  // ============ FILTROS ADICIONALES ============
  
  /**
   * Obtiene provincias filtradas por país
   * @param countryId ID del país
   * @returns Promise<Province[]>
   */
  async getProvincesByCountry(countryId: number): Promise<Province[]> {
    try {
      const response = await httpAdapter.get<Province[]>(`${this.provincesUrl}?country_id=${countryId}`);
      return response || [];
    } catch (error) {
      console.error("Error al obtener provincias por país:", error);
      return [];
    }
  }

  /**
   * Obtiene localidades filtradas por provincia
   * @param provinceId ID de la provincia
   * @returns Promise<Locality[]>
   */
  async getLocalitiesByProvince(provinceId: number): Promise<Locality[]> {
    try {
      const response = await httpAdapter.get<Locality[]>(`${this.localitiesUrl}?province_id=${provinceId}`);
      return response || [];
    } catch (error) {
      console.error("Error al obtener localidades por provincia:", error);
      return [];
    }
  }

  /**
   * Obtiene localidades filtradas por zona
   * @param zoneId ID de la zona
   * @returns Promise<Locality[]>
   */
  async getLocalitiesByZone(zoneId: number): Promise<Locality[]> {
    try {
      const response = await httpAdapter.get<Locality[]>(`${this.localitiesUrl}?zone_id=${zoneId}`);
      return response || [];
    } catch (error) {
      console.error("Error al obtener localidades por zona:", error);
      return [];
    }
  }
}

export default LocationService;