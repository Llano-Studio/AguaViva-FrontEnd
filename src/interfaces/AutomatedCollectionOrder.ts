export interface GeneratedRouteSheetDriver {
  id: number;
  name: string;
}

export interface GeneratedRouteSheetFile {
  filename: string;
  downloadUrl: string;
  date: string;        // ISO string
  vehicleId: number;
  vehicleName: string | null; 
  vehicleCode: string | null;   
  driverId: number;
  driverName: string | null;     // nuevo (puede venir null)
  drivers?: GeneratedRouteSheetDriver[]; // lista de choferes candidatos
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
  zoneIds?: number[];   // se enviará como "1,2,3" en query por el servicio
}

export interface GenerateCollectionPdfBody {
  includeSignatureField?: boolean;
  filterDate?: string;        // ISO string
  additionalNotes?: string;
}

export interface GenerateCollectionPdfResponse {
  url: string;
  filename: string;
  route_sheet_id: number;
  generated_at: string;       // ISO string
  total_collections: number;
}