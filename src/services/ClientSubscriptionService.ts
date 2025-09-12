import { httpAdapter } from "./httpAdapter";

export class ClientSubscriptionService {
  private baseUrl = "/customer-subscriptions";

  async createSubscription(data: any) {
    return await httpAdapter.post<any>(data, this.baseUrl);
  }

  async getSubscriptions(params?: { page?: number; limit?: number; customer_id?: number }) {
    return await httpAdapter.get<any>(this.baseUrl, { params });
  }

  async getSubscriptionById(id: number) {
    return await httpAdapter.get<any>(`${this.baseUrl}/${id}`);
  }

  async updateSubscription(id: number, data: any) {
    return await httpAdapter.patch<any>(data, `${this.baseUrl}/${id}`);
  }

  async deleteSubscription(id: number) {
    return await httpAdapter.delete(`${this.baseUrl}/${id}`);
  }

  async getSubscriptionsByCustomer(
    customerId: number,
    params?: { page?: number; limit?: number; search?: string; status?: string; [key: string]: any }
  ) {
    return await httpAdapter.get<any>(`${this.baseUrl}/customer/${customerId}`, { params });
  }
}