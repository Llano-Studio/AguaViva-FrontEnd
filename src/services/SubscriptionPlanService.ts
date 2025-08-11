import {
  SubscriptionPlan,
  CreateSubscriptionPlanDTO,
  SubscriptionPlansResponse,
  AddProductToPlanDTO,
  UpdateProductQuantityDTO,
  AdjustProductQuantitiesDTO,
  AdjustPricesDTO,
} from "../interfaces/SubscriptionPlan";
import { httpAdapter } from "./httpAdapter";

export class SubscriptionPlanService {
  private plansUrl = "/subscription-plans";

  async getSubscriptionPlans(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<SubscriptionPlansResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<SubscriptionPlansResponse>(this.plansUrl, { params: safeParams });
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | null> {
    try {
      return await httpAdapter.get<SubscriptionPlan>(`${this.plansUrl}/${id}`);
    } catch (error) {
      console.error("Error en getSubscriptionPlanById:", error);
      return null;
    }
  }

  async createSubscriptionPlan(plan: CreateSubscriptionPlanDTO): Promise<SubscriptionPlan | null> {
    try {
      return await httpAdapter.post<SubscriptionPlan>(plan, this.plansUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear abono");
    }
  }

  async updateSubscriptionPlan(id: number, plan: Partial<CreateSubscriptionPlanDTO>): Promise<SubscriptionPlan | null> {
    try {
      return await httpAdapter.patch<SubscriptionPlan>(plan, `${this.plansUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar abono");
    }
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.plansUrl}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar abono");
    }
  }

  async addProductToPlan(planId: number, data: AddProductToPlanDTO): Promise<SubscriptionPlan> {
    return await httpAdapter.post<SubscriptionPlan>(data, `${this.plansUrl}/${planId}/products`);
  }

  async updateProductQuantity(planId: number, productId: number, data: UpdateProductQuantityDTO): Promise<SubscriptionPlan> {
    return await httpAdapter.patch<SubscriptionPlan>(data, `${this.plansUrl}/${planId}/products/${productId}`);
  }

  async removeProductFromPlan(planId: number, productId: number): Promise<SubscriptionPlan> {
    return await httpAdapter.delete<SubscriptionPlan>(`${this.plansUrl}/${planId}/products/${productId}`);
  }

  async adjustAllPrices(data: AdjustPricesDTO): Promise<{ message: string; updated_count: number }> {
    return await httpAdapter.post<{ message: string; updated_count: number }>(data, `${this.plansUrl}/adjust-prices`);
  }

  async adjustProductQuantities(planId: number, data: AdjustProductQuantitiesDTO): Promise<SubscriptionPlan> {
    return await httpAdapter.post<SubscriptionPlan>(data, `${this.plansUrl}/${planId}/adjust-product-quantities`);
  }
}