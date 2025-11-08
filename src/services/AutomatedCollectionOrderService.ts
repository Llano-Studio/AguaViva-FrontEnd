import { httpAdapter } from "./httpAdapter";
import type {
  GeneratedRouteSheetListResponse,
  GeneratedRouteSheetQuery,
  GenerateCollectionPdfBody,
  GenerateCollectionPdfResponse,
} from "../interfaces/AutomatedCollectionOrder";

export class AutomatedCollectionOrderService {
  private baseUrl = "/automated-collection/orders";

  async getGeneratedRouteSheets(
    params?: GeneratedRouteSheetQuery
  ): Promise<GeneratedRouteSheetListResponse> {
    const url = `${this.baseUrl}/route-sheet/generated`;

    // Normalizar zoneIds array -> CSV en query
    const finalParams: any = { ...(params || {}) };
    if (Array.isArray(finalParams.zoneIds)) {
      finalParams.zoneIds = finalParams.zoneIds.join(",");
    }

    return await httpAdapter.get<GeneratedRouteSheetListResponse>(url, { params: finalParams });
  }

  async generateCollectionPDF(
    routeSheetId: number,
    body?: GenerateCollectionPdfBody
  ): Promise<GenerateCollectionPdfResponse> {
    const url = `/route-sheets/${routeSheetId}/generate-collection-pdf`;
    // Adapter usa post<T>(data, url)
    return await httpAdapter.post<GenerateCollectionPdfResponse>(body ?? {}, url);
  }
}

export default AutomatedCollectionOrderService;