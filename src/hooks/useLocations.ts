import { useState, useEffect, useCallback } from "react";
import { Country, Province, Locality, Zone } from "../interfaces/Locations";
import { LocationService } from "../services/LocationsService";

export const useLocations = () => {
  const locationService = new LocationService();

  // Estados para almacenar datos
  const [zones, setZones] = useState<Zone[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<Locality | null>(null);

  // Estados para manejo de carga y errores
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============ ZONES ============
  const fetchZones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getZones();
      setZones(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener zonas");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ COUNTRIES ============
  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getCountries();
      setCountries(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener países");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCountryById = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getCountryById(id);
      setSelectedCountry(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener país");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ PROVINCES ============
  const fetchProvinces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getProvinces();
      setProvinces(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener provincias");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProvinceById = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getProvinceById(id);
      setSelectedProvince(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener provincia");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProvincesByCountry = useCallback(async (countryId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getProvincesByCountry(countryId);
      setProvinces(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener provincias por país");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ LOCALITIES ============
  const fetchLocalities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getLocalities();
      setLocalities(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener localidades");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLocalityById = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getLocalityById(id);
      setSelectedLocality(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener localidad");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLocalitiesByProvince = useCallback(async (provinceId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getLocalitiesByProvince(provinceId);
      setLocalities(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener localidades por provincia");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLocalitiesByZone = useCallback(async (zoneId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await locationService.getLocalitiesByZone(zoneId);
      setLocalities(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener localidades por zona");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Estados
    zones,
    countries,
    provinces,
    localities,
    selectedZone,
    selectedCountry,
    selectedProvince,
    selectedLocality,
    isLoading,
    error,

    // Funciones para zonas
    fetchZones,

    // Funciones para países
    fetchCountries,
    fetchCountryById,

    // Funciones para provincias
    fetchProvinces,
    fetchProvinceById,
    fetchProvincesByCountry,

    // Funciones para localidades
    fetchLocalities,
    fetchLocalityById,
    fetchLocalitiesByProvince,
    fetchLocalitiesByZone,

    // Setters
    setZones,
    setCountries,
    setProvinces,
    setLocalities,
    setSelectedZone,
    setSelectedCountry,
    setSelectedProvince,
    setSelectedLocality,
  };
};

export default useLocations;