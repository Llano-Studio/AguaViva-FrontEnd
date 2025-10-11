export interface ManualCollectionGenerateDTO {
  customer_id: number;
  selected_cycles: number[];
  collection_date: string; // YYYY-MM-DD
  notes?: string;
}

export interface ManualCollectionGenerateResponse {
  success: boolean;
  order_id: number;
  action: string; // ej: "created"
  total_amount: number;
  cycles_processed: number;
  message: string;
}

export interface ManualCollectionCustomerInfo {
  person_id: number;
  name: string;
  phone: string;
  address: string;
  zone_name: string;
}

export type ManualCollectionPaymentStatus = "OVERDUE" | "PENDING" | "PAID" | "PARTIAL" | string;

export interface ManualCollectionPendingCycle {
  cycle_id: number;
  subscription_id: number;
  subscription_plan_name: string;
  cycle_number: number;
  payment_due_date: string; // YYYY-MM-DD
  pending_balance: number;
  days_overdue: number;
  payment_status: ManualCollectionPaymentStatus;
}

export interface ManualCollectionPendingCyclesResponse {
  customer_info: ManualCollectionCustomerInfo;
  pending_cycles: ManualCollectionPendingCycle[];
  total_pending: number;
}