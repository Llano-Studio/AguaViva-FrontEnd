export interface GeneratedRouteSheetFile {
  filename: string;
  downloadUrl: string;
  date: string;        // ISO string
  vehicleId: number;
  driverId: number;
  zoneIds: number[];
  sizeBytes: number;
  createdAt: string;   // ISO string
}

export interface GeneratedRouteSheetListResponse {
  success: boolean;
  message: string;
  data: GeneratedRouteSheetFile[];
  total: number;
}

export interface GeneratedRouteSheetQuery {
  page?: number;
  limit?: number;
  dateFrom?: string;    // ISO string
  dateTo?: string;      // ISO string
  vehicleId?: number;
  driverId?: number;
  zoneIds?: number[];   // se enviará como "1,2,3" en query
}