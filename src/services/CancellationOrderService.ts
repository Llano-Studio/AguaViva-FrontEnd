import { httpAdapter } from "./httpAdapter";
import {
  CancellationOrder,
  CreateCancellationOrderDTO,
  CancellationOrderQueryParams,
} from "../interfaces/CancellationOrder";

export class CancellationOrderService {
  private baseUrl = "/cancellation-orders";

  async create(data: CreateCancellationOrderDTO): Promise<CancellationOrder> {
    try {
      return await httpAdapter.post<CancellationOrder>(data, this.baseUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear orden de cancelación");
    }
  }

  async list(params?: CancellationOrderQueryParams): Promise<CancellationOrder[]> {
    try {
      return await httpAdapter.get<CancellationOrder[]>(this.baseUrl, { params });
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener órdenes de cancelación");
    }
  }
}

export default CancellationOrderService;