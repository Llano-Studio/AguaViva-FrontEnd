import { httpAdapter } from "./httpAdapter";
import { Zone, Locality, ZonesResponse, Country, Province } from "../interfaces/Locations";



export class LocationService {
  private zonesUrl = "/zones";
  private localitiesUrl = "/localities";
  private countriesUrl = "/countries";
  private provincesUrl = "/provinces";

  async getZones(): Promise<Zone[]> {
    try {
      const response = await httpAdapter.get<ZonesResponse>(this.zonesUrl);
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener zonas:", error);
      return [];
    }
  }

  async getLocalities(): Promise<Locality[]> {
    try {
      const response = await httpAdapter.get<Locality[]>(this.localitiesUrl);
      return response || [];
    } catch (error) {
      console.error("Error al obtener localidades:", error);
      return [];
    }
  }

  async getCountries(): Promise<Country[]> {
    try {
      const response = await httpAdapter.get<Country[]>(this.countriesUrl);
      return response || [];
    } catch (error) {
      console.error("Error al obtener países:", error);
      return [];
    }
  }

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await httpAdapter.get<Province[]>(this.provincesUrl);
      return response || [];
    } catch (error) {
      console.error("Error al obtener provincias:", error);
      return [];
    }
  }
}