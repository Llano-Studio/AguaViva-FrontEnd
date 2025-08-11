export interface Zone {
  zone_id: number;
  name: string;
  code: string;
  locality?: Locality;
}

export interface Locality {
  locality_id: number;
  code: string;
  name: string;
  province_id: number;
  zone_id: number;
  province?: any;
  zone?: Zone;
}

export interface ZonesResponse {
  data: Zone[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

export interface Country {
  country_id: number;
  code: string;
  name: string;
}

export interface Province {
  province_id: number;
  code: string;
  name: string;
  country_id: number;
  country?: Country;
}