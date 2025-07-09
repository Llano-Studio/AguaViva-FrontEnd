export interface Vehicle {
  vehicle_id: number;
  code: string;
  name: string;
  description: string;
}

export interface CreateVehicleDTO {
  code: string;
  name: string;
  description: string;
}

export interface VehiclesResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleZoneAssignment {
  vehicle_zone_id: number;
  vehicle_id: number;
  zone_id: number;
  assigned_at: string;
  is_active: boolean;
  notes: string;
  zone: any; // Puedes tipar mejor si tienes la interfaz Zone
}

export interface VehicleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface VehicleZoneFormData {
  countryId: number;
  provinceId: number;
  localityId: number;
  zoneId: number;
  notes?: string;
  isActive: boolean;
}