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