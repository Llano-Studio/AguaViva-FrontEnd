import { Locality, Zone, Province } from "./Locations";

export interface Client {
  person_id: number;
  name: string;
  phone: string;
  additionalPhones: string;
  address: string;
  alias: string;
  taxId: string;
  localityId: number;
  zoneId: number;
  registrationDate: string;
  type: ClientType;

  registration_date: string;
  locality: Locality;
  zone: Zone;
  loaned_products_detail: LoanedProduct[];
  payment_semaphore_status: PaymentSemaphoreStatus;
  is_active: boolean;
  owns_returnable_containers: boolean;
  available_credits: []
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

export enum ClientType {
  INDIVIDUAL = "INDIVIDUAL",
  PLAN = "PLAN", // Usar solo PLAN para consistencia
}

export enum PaymentSemaphoreStatus {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED"
}