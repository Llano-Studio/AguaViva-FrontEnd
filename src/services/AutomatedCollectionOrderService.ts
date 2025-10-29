import { httpAdapter } from "./httpAdapter";
import type {
  GeneratedRouteSheetListResponse,
  GeneratedRouteSheetQuery,
} from "../interfaces/AutomatedCollectionOrder";

export class AutomatedCollectionOrderService {
  private baseUrl = "/automated-collection/orders";

  async getGeneratedRouteSheets(
    params?: GeneratedRouteSheetQuery
  ): Promise<GeneratedRouteSheetListResponse> {
    const url = `${this.baseUrl}/route-sheet/generated`;
    return await httpAdapter.get<GeneratedRouteSheetListResponse>(url, { params });
  }
}

export default AutomatedCollectionOrderService;