export interface OrderOneOffItem {
  product_id: number;
  quantity: number;
  price_list_id?: number;
  notes?: string;
}

export interface OrderOneOff {
  purchase_id: number;
  person_id: number;
  sale_channel_id: number;
  items: OrderOneOffItem[];
  delivery_address: string;
  notes?: string;
  paid_amount: number;
  // Otros campos de respuesta que tu backend devuelva (agrega según lo que recibas)
  created_at?: string;
  updated_at?: string;
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
  items: OrderOneOffItem[];
  delivery_address: string;
  notes?: string;
  paid_amount: number;
}