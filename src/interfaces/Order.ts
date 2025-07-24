export type OrderType = "HYBRID" | "SUBSCRIPTION" | "CONTRACT_DELIVERY";
export type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PREPARATION" | "READY_FOR_DELIVERY" | "IN_DELIVERY" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export interface OrderItem {
  order_item_id: number;
  product_id: number;
  quantity: number;
  subtotal: string;
  total_amount: string;
  amount_paid: string;
  product: {
    product_id: number;
    description: string;
    price: string;
  };
}

export interface Order {
  order_id: number;
  customer_id: number;
  contract_id?: number;
  subscription_id?: number;
  sale_channel_id: number;
  order_date: string;
  scheduled_delivery_date: string;
  delivery_time: string;
  total_amount: string;
  paid_amount: string;
  order_type: OrderType;
  status: OrderStatus;
  notes?: string;
  order_item: OrderItem[];
  customer: any; // Puedes tipar con Client si lo tienes
  sale_channel: {
    sale_channel_id: number;
    name: string;
  };
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateOrderDTO {
  customer_id: number;
  contract_id?: number;
  subscription_id?: number;
  sale_channel_id: number;
  order_date: string;
  scheduled_delivery_date: string;
  delivery_time: string;
  total_amount: string;
  paid_amount: string;
  order_type: OrderType;
  status: OrderStatus;
  notes?: string;
  items: OrderItemInput[];
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  price_list_id?: number;
  notes?: string;
}

export interface CreateOrderFormDTO extends CreateOrderDTO {
  customer_address?: string;
  customer_id_display?: number;
  zone?: string;
  mobile?: string;
}

export interface OrderItemInputForm extends OrderItemInput {
  product_name?: string;
  abono_id?: string;
  abono_name?: string;
  price_unit?: string;
  price_total_item?: string;
  image_url?: string;
  is_returnable?: boolean;
  price_list_name?: string;
}