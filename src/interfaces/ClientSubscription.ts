export type DeliveryDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface DeliveryPreferences {
  preferred_time_range?: string | null;
  preferred_days?: DeliveryDay[];
  avoid_times?: string[];
  special_instructions?: string;
  preferred_time_range_start?: string;
  preferred_time_range_end?: string;
  avoid_times_start?: string;
  avoid_times_end?: string;
}

export interface SubscriptionCycleDetail {
  cycle_detail_id: number;
  product_id: number;
  planned_quantity: number;
  delivered_quantity: number;
  remaining_balance: number;
  product: any;
}

export interface SubscriptionCycle {
  cycle_id: number;
  cycle_start: string;
  cycle_end: string;
  notes: string | null;
  subscription_cycle_detail: SubscriptionCycleDetail[];
}

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export type PaymentMode = "ADVANCE" | "ARREARS";

export interface ClientSubscription {
  subscription_id: number;
  customer_id: number;
  subscription_plan_id: number;
  start_date: string;            // YYYY-MM-DD
  collection_day: number;        // 1..31
  payment_mode: PaymentMode;     // ADVANCE | ARREARS
  payment_due_day?: number | null; // requerido si ARREARS
  status: SubscriptionStatus;
  notes?: string | null;
  delivery_preferences?: DeliveryPreferences;
  subscription_plan?: any;
  customer?: any;
  subscription_cycle?: SubscriptionCycle[];
  orders_count?: number;
}

export interface CreateClientSubscriptionDTO {
  customer_id: number;
  subscription_plan_id: number;
  start_date: string;
  collection_day: number;
  payment_mode?: PaymentMode;      // default ADVANCE si no se envía
  payment_due_day?: number | null; // solo si ARREARS
  status: SubscriptionStatus;
  notes?: string;
  delivery_preferences?: DeliveryPreferences;
}

export interface UpdateClientSubscriptionDTO {
  subscription_plan_id?: number;
  start_date?: string;
  collection_day?: number;
  payment_mode?: PaymentMode;
  payment_due_day?: number | null;
  status?: SubscriptionStatus;
  notes?: string;
  delivery_preferences?: DeliveryPreferences;
}

export interface ClientSubscriptionsResponse {
  data: ClientSubscription[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}