import {OrderType, OrderStatus} from "./Order";

export interface OrderOneOffItem {
  purchase_item_id?: number;
  product_id: number;
  quantity: number;
  price_list_id?: number;
  notes?: string;
  unit_price?: string;
  subtotal?: string;
  product?: {
    product_id: number;
    description: string;
    price: string;
    is_returnable: boolean;
  };
  price_list?: {
    price_list_id: number;
    name: string;
  };
}

export interface OrderOneOffItemInputForm extends OrderOneOffItem {
  image_url?: string;
}

export interface OrderOneOff {
  purchase_header_id: number;
  person_id: number;
  sale_channel_id: number;
  purchase_date: string;
  total_amount: string;
  paid_amount: string;
  delivery_address: string;
  notes?: string;
  status: string;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
  person: {
    person_id: number;
    name: string;
    phone: string;
    tax_id: string;
  };
  sale_channel: {
    sale_channel_id: number;
    name: string;
  };
  purchase_items: OrderOneOffItem[];
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
  person_id: number;
  sale_channel_id: number;
  items: {
    product_id: number;
    quantity: number;
    price_list_id?: number;
    notes?: string;
  }[];
  delivery_address: string;
  notes?: string;
  paid_amount: string | number;
}

export interface CreateOrderOneOffFormDTO extends CreateOrderOneOffDTO {
  customer_id_display?: number;
  zone_name?: string;
  zone_id?: string;
  mobile?: string[]
  delivery_time_start?: string;
  delivery_time_end?: string;
  order_type: OrderType;
  status: OrderStatus;
}