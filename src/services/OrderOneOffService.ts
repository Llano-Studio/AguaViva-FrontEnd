import { httpAdapter } from "./httpAdapter";
import {
  OrderOneOff,
  OrdersOneOffResponse,
  CreateOrderOneOffDTO,
} from "../interfaces/OrderOneOff";
import { CreateOrderPaymentDTO, OrderPaymentResponse } from "../interfaces/Order";

export class OrderOneOffService {
  private ordersUrl = "/one-off-purchases/one-off";

  async getOrdersOneOff(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<OrdersOneOffResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<OrdersOneOffResponse>(this.ordersUrl, { params: safeParams });
  }

  async getOrderOneOffById(id: number): Promise<OrderOneOff | null> {
    try {
      return await httpAdapter.get<OrderOneOff>(`${this.ordersUrl}/${id}`);
    } catch (error) {
      return null;
    }
  }

  async createOrderOneOff(order: CreateOrderOneOffDTO): Promise<OrderOneOff> {
    try {
      return await httpAdapter.post<OrderOneOff>(order, this.ordersUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear orden One-Off");
    }
  }

  async updateOrderOneOff(id: number, order: CreateOrderOneOffDTO): Promise<OrderOneOff> {
    try {
      return await httpAdapter.patch<OrderOneOff>(order, `${this.ordersUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar orden One-Off");
    }
  }

  async deleteOrderOneOff(id: number): Promise<{ message: string; deleted: boolean }> {
    try {
      return await httpAdapter.delete<{ message: string; deleted: boolean }>(`${this.ordersUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar orden One-Off");
    }
  }

  async processOneOffOrderPayment(orderId: number, payload: CreateOrderPaymentDTO): Promise<OrderPaymentResponse> {
    try {
      const url = `/orders/one-off/${orderId}/payments`;
      return await httpAdapter.post<OrderPaymentResponse>(payload, url);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al procesar pago de la orden One-Off");
    }
  }

}