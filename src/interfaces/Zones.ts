import { Zone, Locality, ZonesResponse } from "./Locations";

// Si necesitas extender o agregar tipos específicos para el módulo de zonas, hazlo aquí.
// Por ahora, simplemente reexportamos lo necesario desde Locations.

export type { Zone, Locality, ZonesResponse };

// DTO para crear o actualizar una zona
export interface CreateZoneDTO {
  name: string;
  code: string;
  localityId: number;
  countryId?: number;  
  provinceId?: number; 
}