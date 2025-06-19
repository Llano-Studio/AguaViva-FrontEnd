export interface SubscriptionPlanProduct {
  product_id: number;
  product_description: string;
  product_code: string;
  quantity: number;
}

export interface SubscriptionPlan {
  subscription_plan_id: number;
  name: string;
  description: string;
  price: number;
  cycle_days: number;
  deliveries_per_cycle: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  products: SubscriptionPlanProduct[];
}

export interface CreateSubscriptionPlanDTO {
  name: string;
  description: string;
  price: number;
  cycle_days: number;
  deliveries_per_cycle: number;
  active: boolean;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}