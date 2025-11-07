import type { OrderType } from "./Order";

export interface Zone {
  zone_id: number;
  code: string;
  name: string;
  locality?: any;
}

export interface RouteSheetDetail {
  route_sheet_detail_id: number;
  route_sheet_id: number;
  order: {
    order_id: number;
    order_date: string;
    total_amount: string;
    status: string;
    customer: {
      person_id: number;
      name: string;
      phone: string;
      address: string;
    };
    items: Array<{
      order_item_id: number;
      product: {
        product_id: number;
        description: string;
      };
      quantity: number;
      delivered_quantity: number;
      returned_quantity: number;
    }>;
  };
  delivery_status: string;
  delivery_time: string;
  comments: string;
  digital_signature_id?: string;
  is_current_delivery?: boolean;
}

export interface RouteSheet {
  route_sheet_id: number;
  driver: {
    id: number;
    name: string;
    email: string;
  };
  vehicle: {
    vehicle_id: number;
    code: string;
    name: string;
    zones?: Zone[];           // puede venir en algunos endpoints
  };
  delivery_date: string;
  route_notes: string;
  zone_ids?: number[];        // opcional si lo devuelve el backend
  zones_covered?: Zone[];     // nuevo campo de respuesta
  details: RouteSheetDetail[];
}

export interface CreateRouteSheetDTO {
  driver_id: number;
  vehicle_id: number;
  delivery_date: string;
  zone_ids: number[];         // requerido ahora
  route_notes?: string;
  details: Array<{
    order_type: OrderType;
    order_id?: number;
    cycle_payment_id?: number;
    one_off_purchase_id?: number;
    one_off_purchase_header_id?: number;
    delivery_status: string;
    delivery_time: string;
    comments?: string;
  }>;
}

export interface UpdateRouteSheetDTO {
  driver_id: number;
  vehicle_id: number;
  delivery_date: string;
  zone_ids: number[];         // requerido ahora
  route_notes?: string;
  details: Array<{
    route_sheet_detail_id?: number;
    order_type: OrderType;
    order_id?: number;
    cycle_payment_id?: number;
    one_off_purchase_id?: number;
    one_off_purchase_header_id?: number;
    delivery_status: string;
    delivery_time: string;
    comments?: string;
  }>;
}

export interface RouteSheetsResponse {
  data: RouteSheet[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}