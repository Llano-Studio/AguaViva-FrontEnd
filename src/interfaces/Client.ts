export interface Client {
    person_id: number;
    name: string;
    phone: string;
    address: string;
    taxId: string;
    localityId: number;
    zoneId: number;
    registrationDate: string;
    type: ClientType;
  
    registration_date: string;
    locality: Locality;
    zone: Zone;
    loaned_products: LoanedProduct[];
    payment_semaphore_status: PaymentSemaphoreStatus;
  }
  
export interface CreateClientDTO {
    name: string;
    phone: string;
    address: string;
    taxId: string;
    localityId: number;
    zoneId: number;
    registrationDate: string;
    type: ClientType;
  }
  
export interface ClientsResponse {
    data: Client[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
  }

export interface Province {
    province_id: number;
    name: string;
  }
  
export interface Locality {
    locality_id: number;
    name: string;
    province: Province;
  }
  
export interface Zone {
    zone_id: number;
    name: string;
  }
  
export interface LoanedProduct {
    product_id: number;
    description: string;
    loaned_quantity: number;
  }

export enum ClientType {
    INDIVIDUAL = "INDIVIDUAL",
    COMPANY = "COMPANY",
  }

export enum PaymentSemaphoreStatus {
    GREEN = "GREEN",
    YELLOW = "YELLOW",
    RED = "RED"
  }

//export type ClientType = "INDIVIDUAL" | "COMPANY";
//export type PaymentSemaphoreStatus = "GREEN" | "YELLOW" | "RED";