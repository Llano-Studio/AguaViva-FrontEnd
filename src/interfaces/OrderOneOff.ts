export interface OrderOneOffItem {
  product_id: number;
  quantity: number;
}

export interface OrderOneOff {
  purchase_id: number;
  person_id: number;
  product_id: number;
  quantity: number;
  sale_channel_id: number;
  locality_id: number;
  zone_id: number;
  purchase_date: string;
  total_amount: string;
  payment_status: string;
  delivery_status: string;
  notes?: string;
  payment_method_id?: number;
  created_at: string;
  updated_at: string;
  person: {
    person_id: number;
    name: string;
    tax_id?: string;
    address?: string;
  };
  product: {
    product_id: number;
    description: string;
    code?: string;
    price?: string;
  };
  sale_channel?: {
    sale_channel_id: number;
    name: string;
  };
  locality?: {
    locality_id: number;
    name: string;
  };
  zone?: {
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
  person_id: number;
  items: OrderOneOffItem[];
  sale_channel_id: number;
  price_list_id?: number;
  delivery_address: string;
  locality_id: number;
  zone_id: number;
  purchase_date: string;
  notes?: string;
  payment_method_id?: number;
}