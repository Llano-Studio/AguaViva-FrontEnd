export type OrderType = "HYBRID" | "ONE_OFF" | "CONTRACT_DELIVERY";

export const OrderStatusEnum = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PREPARATION: "IN_PREPARATION",
  READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
  IN_DELIVERY: "IN_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatus = typeof OrderStatusEnum[keyof typeof OrderStatusEnum];
export const OrderStatusValues: OrderStatus[] = Object.values(OrderStatusEnum);

// Nuevos tipos auxiliares para la respuesta del GET de Order
export type OrderPaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "CREDITED";
export type TrafficLightStatus = "green" | "yellow" | "red";

export interface OrderProductRef {
  product_id: number;
  description: string;
  price: string;
  is_returnable?: boolean;
}

export interface OrderItem {
  order_item_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  delivered_quantity: number;
  returned_quantity: number;
  price_list_id?: number;
  notes?: string;
  abono_id?: number;
  abono_name?: string;
  product: OrderProductRef;
}

export interface OrderCustomerRef {
  person_id: number;
  name: string;
  phone?: string;
  locality?: {
    locality_id: number;
    name: string;
  };
  zone?: {
    zone_id: number;
    name: string;
  };
}

export interface OrderSaleChannelRef {
  sale_channel_id: number;
  name: string;
}

export interface OrderZoneRef {
  zone_id: number;
  name: string;
}

export interface OrderPayment {
  payment_id: number;
  amount: string;
  payment_date: string; // ISO
  payment_method: string;
  transaction_reference?: string;
  notes?: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  contract_id?: number;
  subscription_id?: number;
  sale_channel_id: number;
  order_date: string; // ISO
  scheduled_delivery_date: string; // ISO
  delivery_time: string; // ej. "14:00-16:00"
  total_amount: string;
  paid_amount: string;
  order_type: OrderType;
  status: OrderStatus;
  notes?: string;
  delivery_address?: string;

  order_item: OrderItem[];

  customer: OrderCustomerRef;
  sale_channel: OrderSaleChannelRef;
  zone?: OrderZoneRef;

  // Nuevos campos del GET
  payment_status?: OrderPaymentStatus;
  remaining_amount?: string;
  traffic_light_status?: TrafficLightStatus;
  payments?: OrderPayment[];
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

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  price_list_id?: number;
  notes?: string;
}

export interface CreateOrderDTO {
  customer_id: number;
  contract_id?: number;
  subscription_id?: number;
  sale_channel_id: number;
  order_date: string; // ISO
  scheduled_delivery_date: string; // ISO
  delivery_time: string;
  total_amount: string;
  paid_amount: string;
  order_type: OrderType;
  status: OrderStatus;
  notes?: string;
  items: OrderItemInput[];
  delivery_address?: string;
}

export interface CreateOrderFormDTO extends CreateOrderDTO {
  customer_address?: string;
  customer_id_display?: number;
  phone?: string;
  customer_name?: string;
  zone_name?: string;
  zone_id?: string;
  mobile?: string[];
  delivery_time_start?: string;
  delivery_time_end?: string;
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

export interface AvailableCredit {
  product_id: number;
  product_description: string;
  planned_quantity: number;
  delivered_quantity: number;
  remaining_balance: number;
}

// Pago de orden (POST /orders/{id}/payments)
export interface CreateOrderPaymentDTO {
  payment_method_id: number;
  amount: number;
  transaction_reference?: string;
  payment_date: string; // ISO
  notes?: string;
}

export interface OrderPaymentResponse {
  payment_transaction_id: number;
  order_id: number;
  amount: string; // viene formateado desde el backend
  payment_method_id: number;
  transaction_reference?: string;
  payment_date: string; // ISO
  notes?: string;
}

export interface UpdateOrderPaymentDTO {
  amount?: string;           // "2400"
  reference?: string;        // "TXN-UPD-789456"
  payment_method?: string;   // "EFECTIVO"
  payment_date?: string;     // ISO string
  notes?: string;
}

export interface UpdateOrderPaymentResponse {
  success: boolean;
  message: string;
  audit_id: number;
  data: {
    transaction_id: number;
    amount: string;
    payment_date: string;  // ISO
    reference?: string;
    notes?: string;
  };
}

export interface DeleteOrderPaymentResponse {
  confirm_deletion: boolean;
  deletion_reason: string;
}