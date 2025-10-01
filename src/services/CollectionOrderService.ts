import { httpAdapter } from "./httpAdapter";
import {
  ManualCollectionGenerateDTO,
  ManualCollectionGenerateResponse,
  ManualCollectionPendingCyclesResponse,
} from "../interfaces/CollectionOrder";

export class CollectionOrderService {
  private baseUrl = "/manual-collection";

  async generate(payload: ManualCollectionGenerateDTO): Promise<ManualCollectionGenerateResponse> {
    try {
      const url = `${this.baseUrl}/generate`;
      return await httpAdapter.post<ManualCollectionGenerateResponse>(payload, url);
    } catch (error: any) {
      throw new Error(
        error?.message ||
          error?.response?.data?.message ||
          "Error al generar el pedido de cobranza"
      );
    }
  }

  async getPendingCyclesByCustomer(customerId: number): Promise<ManualCollectionPendingCyclesResponse> {
    try {
      const url = `${this.baseUrl}/customers/${customerId}/pending-cycles`;
      return await httpAdapter.get<ManualCollectionPendingCyclesResponse>(url);
    } catch (error: any) {
      throw new Error(
        error?.message ||
          error?.response?.data?.message ||
          "Error al obtener ciclos pendientes del cliente"
      );
    }
  }
}