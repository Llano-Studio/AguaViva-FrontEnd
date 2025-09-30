import { httpAdapter } from "./httpAdapter";
import { Order, OrdersResponse, CreateOrderDTO, AvailableCredit, CreateOrderPaymentDTO, OrderPaymentResponse } from "../interfaces/Order";

export class OrderService {
  private ordersUrl = "/orders";

  async getOrders(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<OrdersResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<OrdersResponse>(this.ordersUrl, { params: safeParams });
  }

  async getOrderById(id: number): Promise<Order | null> {
    try {
      return await httpAdapter.get<Order>(`${this.ordersUrl}/${id}`);
    } catch (error) {
      return null;
    }
  }

  async createOrder(order: CreateOrderDTO): Promise<Order> {
    try {
      return await httpAdapter.post<Order>(order, this.ordersUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear orden");
    }
  }

  async updateOrder(id: number, order: Partial<CreateOrderDTO>): Promise<Order | null> {
    try {
      return await httpAdapter.patch<Order>(order, `${this.ordersUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar orden");
    }
  }

  async deleteOrder(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.ordersUrl}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar orden");
    }
  }

  async getAvailableCreditsBySubscription(subscriptionId: number): Promise<AvailableCredit[]> {
    try {
      const url = `${this.ordersUrl}/subscription/${subscriptionId}/available-credits`;
      return await httpAdapter.get<AvailableCredit[]>(url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener créditos disponibles");
    }
  }

  async processOrderPayment(orderId: number, payload: CreateOrderPaymentDTO): Promise<OrderPaymentResponse> {
    try {
      const url = `${this.ordersUrl}/${orderId}/payments`;
      return await httpAdapter.post<OrderPaymentResponse>(payload, url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al procesar pago de la orden");
    }
  }  
}