import { SubscriptionPlan, CreateSubscriptionPlanDTO, SubscriptionPlansResponse } from "../interfaces/SubscriptionPlan";
import { httpAdapter } from "./httpAdapter";

export class SubscriptionPlanService {
  private plansUrl = "/subscription-plans";

  async getSubscriptionPlans(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<SubscriptionPlansResponse> {
    return await httpAdapter.get<SubscriptionPlansResponse>(this.plansUrl, { params });
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | null> {
    try {
      return await httpAdapter.get<SubscriptionPlan>(`${this.plansUrl}/${id}`);
    } catch (error) {
      console.error("Error en getSubscriptionPlanById:", error);
      return null;
    }
  }

  async createSubscriptionPlan(plan: CreateSubscriptionPlanDTO): Promise<any | null> {
    try {
      const response = await httpAdapter.post<any>(plan, this.plansUrl);
      return response;
    } catch (error: any) {
      console.error("Error en createSubscriptionPlan:", error);
      if (error.response) {
        console.error("Datos de respuesta:", error.response.data);
        console.error("Estado de respuesta:", error.response.status);
      }
      return null;
    }
  }

  async updateSubscriptionPlan(id: number, plan: Partial<CreateSubscriptionPlanDTO>): Promise<SubscriptionPlan | null> {
    try {
      return await httpAdapter.patch<SubscriptionPlan>(plan, `${this.plansUrl}/${id}`);
    } catch (error) {
      console.error("Error en updateSubscriptionPlan:", error);
      return null;
    }
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.plansUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deleteSubscriptionPlan:", error);
      return false;
    }
  }
}