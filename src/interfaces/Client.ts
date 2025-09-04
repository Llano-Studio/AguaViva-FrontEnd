import { Locality, Zone, Province } from "./Locations";

export interface Client {
  person_id: number;
  name: string;
  alias: string;
  phone: string;
  additionalPhones: string;
  address: string;
  localityId: number;
  zoneId: number;
  taxId: string;
  type: ClientType;
  registration_date: string;
  locality: {
    locality_id: number;
    province_id: number;
    code: string;
    name: string;
    province: {
      province_id: number;
      country_id: number;
      code: string;
      name: string;
      country: {
        country_id: number;
        code: string;
        name: string;
      };
    };
  };
  zone: {
    zone_id: number;
    code: string;
    name: string;
    locality_id: number;
  };
  is_active: boolean;
  owns_returnable_containers: boolean;
  notes: string;
  loaned_products_detail: LoanedProduct[];
  payment_semaphore_status: PaymentSemaphoreStatus;
  available_credits: AvailableCredit[];
}

export interface CreateClientDTO {
  name: string;
  phone: string;
  additionalPhones?: string;
  address: string;
  alias?: string;
  taxId?: string;
  countryId: number; 
  provinceId: number; 
  localityId: number;
  zoneId: number;
  registrationDate: string;
  type: ClientType;
  notes?: string;
  is_active?: boolean;
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

export interface LoanedProduct {
  product_id: number;
  description: string;
  loaned_quantity: number;
}

export interface AvailableCredit {
  product_id: number;
  product_description: string;
  planned_quantity: number;
  delivered_quantity: number;
  remaining_balance: number;
}

export enum ClientType {
  INDIVIDUAL = "INDIVIDUAL",
  PLAN = "PLAN",
}

export enum PaymentSemaphoreStatus {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED"
}