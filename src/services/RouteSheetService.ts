import { httpAdapter } from "./httpAdapter";
import { RouteSheet, CreateRouteSheetDTO, UpdateRouteSheetDTO, RouteSheetsResponse } from "../interfaces/RouteSheet";

export class RouteSheetService {
  private baseUrl = "/route-sheets";

  async getRouteSheets(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<RouteSheetsResponse> {
    return await httpAdapter.get<RouteSheetsResponse>(this.baseUrl, { params });
  }

  async getRouteSheetById(id: number): Promise<RouteSheet> {
    return await httpAdapter.get<RouteSheet>(`${this.baseUrl}/${id}`);
  }

  async createRouteSheet(data: CreateRouteSheetDTO): Promise<RouteSheet> {
    return await httpAdapter.post<RouteSheet>(data, this.baseUrl);
  }

  async updateRouteSheet(id: number, data: UpdateRouteSheetDTO): Promise<RouteSheet> {
    return await httpAdapter.patch<RouteSheet>(data, `${this.baseUrl}/${id}`);
  }

  async deleteRouteSheet(id: number): Promise<{ message: string; deleted: boolean }> {
    return await httpAdapter.delete<{ message: string; deleted: boolean }>(`${this.baseUrl}/${id}`);
  }

  async printRouteSheet(data: { route_sheet_id: number; format: string; include_map?: boolean; include_signature_field?: boolean; include_product_details?: boolean }): Promise<{ url: string; filename: string }> {
    return await httpAdapter.post<{ url: string; filename: string }>(data, `${this.baseUrl}/print`);
  }
}