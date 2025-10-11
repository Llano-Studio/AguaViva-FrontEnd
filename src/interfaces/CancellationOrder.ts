export type CancellationOrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | string;

export interface CreateCancellationOrderDTO {
  subscription_id: number;
  scheduled_collection_date: string; // YYYY-MM-DD
  notes?: string;
}

export interface CancellationOrder {
  cancellation_order_id: number;
  subscription_id: number;
  scheduled_collection_date: string;
  actual_collection_date?: string | null;
  status: CancellationOrderStatus;
  route_sheet_id?: number | null;
  notes?: string;
  created_at?: string;
  rescheduled_count: number;
  subscription?: {
    customer_id: number;
    subscription_plan_id: number;
    status: string;
  };
}

export interface CancellationOrderQueryParams {
  page?: number;
  limit?: number;
  status?: CancellationOrderStatus;
  subscription_id?: number;
  customer_id?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  [key: string]: any;
}