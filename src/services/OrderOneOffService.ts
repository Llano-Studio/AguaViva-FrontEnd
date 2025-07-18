import { httpAdapter } from "./httpAdapter";
import { OrderOneOff, OrdersOneOffResponse, CreateOrderOneOffDTO } from "../interfaces/OrderOneOff";

export class OrderOneOffService {
  private ordersUrl = "/orders/one-off";

  async getOrders(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<OrdersOneOffResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<OrdersOneOffResponse>(this.ordersUrl, { params: safeParams });
  }

  async getOrderById(id: number): Promise<OrderOneOff | null> {
    try {
      return await httpAdapter.get<OrderOneOff>(`${this.ordersUrl}/${id}`);
    } catch (error) {
      return null;
    }
  }

  async createOrder(order: CreateOrderOneOffDTO): Promise<OrderOneOff> {
    try {
      return await httpAdapter.post<OrderOneOff>(order, this.ordersUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear orden One-Off");
    }
  }

  async updateOrder(id: number, order: Partial<CreateOrderOneOffDTO>): Promise<OrderOneOff | null> {
    try {
      return await httpAdapter.patch<OrderOneOff>(order, `${this.ordersUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar orden One-Off");
    }
  }

  async deleteOrder(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.ordersUrl}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar orden One-Off");
    }
  }
}