import {OrderType, OrderStatus} from "./Order";

export interface OrderOneOffItem {
  product_id: number;
  quantity: number;
  unit_price?: string;
  subtotal?: string;
  product?: {
    product_id: number;
    description: string;
    price: string;
    is_returnable: boolean;
  };
}

export interface OrderOneOffItemInputForm extends OrderOneOffItem {
  image_url?: string;
}

export interface OrderOneOff {
  purchase_id: number;
  person_id: number;
  sale_channel_id: number;
  locality_id: number;
  zone_id: number;
  purchase_date: string;
  scheduled_delivery_date: string;
  delivery_time: string;
  total_amount: string;
  product: {
    product_id: number;
    description: string;
    price: string;
  };
  person: {
    person_id: number;
    name: string;
  };
  sale_channel: {
    sale_channel_id: number;
    name: string;
  };
  locality: {
    locality_id: number;
    name: string;
  };
  zone: {
    zone_id: number;
    name: string;
  };
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
  customer: {
    name: string;
    phone: string;
    alias?: string;
    address: string;
    taxId?: string;
    localityId: number;
    zoneId: number;
    type: string;
  };
  items: {
    product_id: number;
    quantity: number;
  }[];
  sale_channel_id: number;
  requires_delivery: boolean;
  price_list_id: number;
  delivery_address: string;
  locality_id: number;
  zone_id: number;
  purchase_date: string;
  scheduled_delivery_date: string;
  delivery_time: string;
}

export interface CreateOrderOneOffFormDTO extends CreateOrderOneOffDTO {
  customer_id_display?: number;
  zone_name?: string;
  mobile?: string[]
  delivery_time_start?: string;
  delivery_time_end?: string;
  order_type: OrderType;
  status: OrderStatus;
}