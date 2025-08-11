import {OrderType, OrderStatus} from "./Order";

export interface OneOffCustomer {
  name: string;
  phone: string;
  alias?: string;
  address: string;
  taxId?: string;
  localityId: number;
  zoneId: number;
  type: string;
}

export interface OneOffProductPriceList {
  price_list_id: number;
  name: string;
  unit_price: string;
}

export interface OneOffProduct {
  product_id: number;
  description: string;
  quantity: number;
  price_list: OneOffProductPriceList;
}

export interface OneOffPerson {
  person_id: number;
  name: string;
}

export interface OneOffSaleChannel {
  sale_channel_id: number;
  name: string;
}

export interface OneOffLocality {
  locality_id: number;
  name: string;
}

export interface OneOffZone {
  zone_id: number;
  name: string;
}

export interface OneOffProductForm extends OneOffProduct {
  image_url?: string;
}

export interface OrderOneOff {
  purchase_id: number;
  person_id: number;
  purchase_date: string;
  scheduled_delivery_date: string;
  delivery_time: string;
  total_amount: string;
  paid_amount: string;
  status: string;
  requires_delivery: boolean;
  notes?: string;
  products: OneOffProduct[];
  person: OneOffPerson;
  sale_channel: OneOffSaleChannel;
  locality: OneOffLocality;
  zone: OneOffZone;
}

export interface OrdersOneOffResponse {
  data: OrderOneOff[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateOrderOneOffDTO {
  customer: OneOffCustomer;
  items: OrderOneOffItemInput[];
  sale_channel_id: number;
  requires_delivery: boolean;
  delivery_address: string;
  locality_id: number;
  zone_id: number;
  purchase_date: string;
  scheduled_delivery_date: string;
  delivery_time: string;
  total_amount: string;
  paid_amount: string;
  notes?: string;
  status: string;
}

export interface OrderOneOffItemInput {
  product_id: number;
  quantity: number;
  price_list_id: number;
}

export interface OrderOneOffItemInputForm extends OrderOneOffItemInput {
  product_name?: string;
  price_unit?: string;
  price_total_item?: string;
  image_url?: string;
  is_returnable?: boolean;
  price_list_name?: string;
  notes?: string;
}

export interface CreateOrderOneOffFormDTO extends CreateOrderOneOffDTO {
  customer_id_display?: number;
  zone_name?: string;
  mobile?: string[]
  delivery_time_start?: string;
  delivery_time_end?: string;
  order_type: OrderType;
}