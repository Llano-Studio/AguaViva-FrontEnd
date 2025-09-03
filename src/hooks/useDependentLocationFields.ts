import { useEffect, useState } from "react";
import { LocationService } from "../services/LocationsService";
import { Country, Province, Locality, Zone } from "../interfaces/Locations";

export function useDependentLocationFields(initialCountry = 0, initialProvince = 0, initialLocality = 0, initialZone = 0) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<number>(initialCountry);
  const [selectedProvince, setSelectedProvince] = useState<number>(initialProvince);
  const [selectedLocality, setSelectedLocality] = useState<number>(initialLocality);
  const [selectedZone, setSelectedZone] = useState<number>(initialZone);

  useEffect(() => {
    const fetchData = async () => {
      const locationService = new LocationService();
      setCountries(await locationService.getCountries());
      setProvinces(await locationService.getProvinces());
      setLocalities(await locationService.getLocalities());
      const zonesResponse = await locationService.getZones();
      setZones(zonesResponse.data);
    };
    fetchData();
  }, []);

  const filteredProvinces = provinces.filter(p => p.country_id === selectedCountry);
  const filteredLocalities = localities.filter(l => l.province_id === selectedProvince);
  const filteredZones = zones.filter(z => 
    Array.isArray(z.locality) && z.locality.some(l => l.locality_id === selectedLocality)
  );

  return {
    countries,
    provinces,        
    localities, 
    zones,    
    filteredProvinces,
    filteredLocalities,
    filteredZones,
    selectedCountry,
    selectedProvince,
    selectedLocality,
    selectedZone,
    setSelectedCountry,
    setSelectedProvince,
    setSelectedLocality,
    setSelectedZone,
  };
}