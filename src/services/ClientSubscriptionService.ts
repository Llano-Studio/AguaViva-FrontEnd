import { httpAdapter } from "./httpAdapter";
import { ClientSubscription, ClientSubscriptionsResponse, CreateClientSubscriptionDTO, UpdateClientSubscriptionDTO} from "../interfaces/ClientSubscription";

export class ClientSubscriptionService {
  private baseUrl = "/customer-subscriptions";

  async createSubscription(data: CreateClientSubscriptionDTO) {
    return await httpAdapter.post<ClientSubscription>(data, this.baseUrl);
  }

  async getSubscriptions(params?: { page?: number; limit?: number; customer_id?: number }) {
    return await httpAdapter.get<ClientSubscriptionsResponse>(this.baseUrl, { params });
  }

  async getSubscriptionById(id: number) {
    return await httpAdapter.get<ClientSubscription>(`${this.baseUrl}/${id}`);
  }

  async updateSubscription(id: number, data: UpdateClientSubscriptionDTO) {
    return await httpAdapter.patch<ClientSubscription>(data, `${this.baseUrl}/${id}`);
  }

  async deleteSubscription(id: number) {
    return await httpAdapter.delete(`${this.baseUrl}/${id}`);
  }

  async getSubscriptionsByCustomer(
    customerId: number,
    params?: { page?: number; limit?: number; search?: string; status?: string; [key: string]: any }
  ) {
    return await httpAdapter.get<ClientSubscriptionsResponse>(`${this.baseUrl}/customer/${customerId}`, { params });
  }
}