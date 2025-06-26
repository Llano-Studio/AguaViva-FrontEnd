import {PriceList, CreatePriceListDTO, UpdatePriceListDTO, PriceListsResponse, PriceListHistoryResponse,} from "../interfaces/PriceList";
import { httpAdapter } from "./httpAdapter";

export class PriceListService {
  private priceListUrl = "/price-list";

  async getPriceLists(params?: { page?: number; limit?: number; search?: string; sortBy?: string; [key: string]: any }): Promise<PriceListsResponse> {
    const safeParams = {
      ...params,
      page: Number(params?.page) || 1,
      limit: Number(params?.limit) || 10,
    };
    return await httpAdapter.get<PriceListsResponse>(this.priceListUrl, { params: safeParams });
  }

  async getPriceListById(id: number): Promise<PriceList | null> {
    try {
      return await httpAdapter.get<PriceList>(`${this.priceListUrl}/${id}`);
    } catch (error) {
      console.error("Error en getPriceListById:", error);
      return null;
    }
  }

  async createPriceList(data: CreatePriceListDTO): Promise<PriceList | null> {
    try {
      return await httpAdapter.post<PriceList>(data, this.priceListUrl);
    } catch (error: any) {
      console.error("Error en createPriceList:", error);
      return null;
    }
  }

  async updatePriceList(id: number, data: UpdatePriceListDTO): Promise<PriceList | null> {
    try {
      return await httpAdapter.patch<PriceList>(data, `${this.priceListUrl}/${id}`);
    } catch (error) {
      console.error("Error en updatePriceList:", error);
      return null;
    }
  }

  async deletePriceList(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.priceListUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error en deletePriceList:", error);
      return false;
    }
  }

  // Extra: aplicar porcentaje a todos los items
  async applyPercentage(id: number, payload: { percentage: number; reason: string; createdBy: string }) {
    try {
      return await httpAdapter.patch<any>(payload, `${this.priceListUrl}/${id}/apply-percentage`);
    } catch (error) {
      console.error("Error en applyPercentage:", error);
      return null;
    }
  }

  // Extra: historial de cambios de una lista
  async getPriceListHistory(id: number, params?: { page?: number; limit?: number }): Promise<PriceListHistoryResponse | null> {
    try {
      return await httpAdapter.get<PriceListHistoryResponse>(`${this.priceListUrl}/${id}/history`, { params });
    } catch (error) {
      console.error("Error en getPriceListHistory:", error);
      return null;
    }
  }

  // Extra: historial de cambios de un item
  async getPriceListItemHistory(itemId: number, params?: { page?: number; limit?: number }): Promise<PriceListHistoryResponse | null> {
    try {
      return await httpAdapter.get<PriceListHistoryResponse>(`${this.priceListUrl}/item/${itemId}/history`, { params });
    } catch (error) {
      console.error("Error en getPriceListItemHistory:", error);
      return null;
    }
  }
}