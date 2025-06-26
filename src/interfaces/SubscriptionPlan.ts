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
  default_cycle_days: number;
  default_deliveries_per_cycle: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products: SubscriptionPlanProduct[];
}

export interface CreateSubscriptionPlanDTO {
  name: string;
  description: string;
  price: number;
  default_cycle_days: number;
  default_deliveries_per_cycle: number;
  is_active: boolean;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddProductToPlanDTO {
  product_id: number;
  product_quantity: number;
}

export interface UpdateProductQuantityDTO {
  product_quantity: number;
}

export interface AdjustProductQuantitiesDTO {
  products: { product_id: number; quantity: number }[];
}

export interface AdjustPricesDTO {
  percentage?: number;
  fixedAmount?: number;
  reason: string;
}