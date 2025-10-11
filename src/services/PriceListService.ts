import {PriceList, CreatePriceListDTO, UpdatePriceListDTO, PriceListsResponse, PriceListHistoryListResponse, UndoPriceUpdateRequest, UndoPriceUpdateResponse,} from "../interfaces/PriceList";
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
      throw new Error(error?.message || error?.response?.data?.message || "Error al crear lista de precios");
    }
  }

  async updatePriceList(id: number, data: UpdatePriceListDTO): Promise<PriceList | null> {
    try {
      return await httpAdapter.patch<PriceList>(data, `${this.priceListUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al actualizar lista de precios");
    }
  }

  async deletePriceList(id: number): Promise<boolean> {
    try {
      await httpAdapter.delete(`${this.priceListUrl}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al eliminar lista de precios");
    }
  }

  // Extra: aplicar porcentaje a todos los items
  async applyPercentage(id: number, payload: { percentage: number; reason: string;}) {
    try {
      return await httpAdapter.post<any>(payload, `${this.priceListUrl}/${id}/apply-percentage`);
    } catch (error) {
      console.error("Error en applyPercentage:", error);
      return null;
    }
  }

  // Nuevo: deshacer actualizaciones de precios
  async undoPriceUpdate(payload: UndoPriceUpdateRequest): Promise<UndoPriceUpdateResponse> {
    try {
      return await httpAdapter.post<UndoPriceUpdateResponse>(payload, `${this.priceListUrl}/undo-price-update`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al deshacer actualizaciones de precios");
    }
  }

  // Historial de cambios de una lista (con meta)
  async getPriceListHistory(id: number, params?: { page?: number; limit?: number }): Promise<PriceListHistoryListResponse | null> {
    try {
      return await httpAdapter.get<PriceListHistoryListResponse>(`${this.priceListUrl}/${id}/history`, { params });
    } catch (error) {
      console.error("Error en getPriceListHistory:", error);
      return null;
    }
  }

  // Historial de cambios de un item (con meta)
  async getPriceListItemHistory(itemId: number, params?: { page?: number; limit?: number }): Promise<PriceListHistoryListResponse | null> {
    try {
      return await httpAdapter.get<PriceListHistoryListResponse>(`${this.priceListUrl}/item/${itemId}/history`, { params });
    } catch (error) {
      console.error("Error en getPriceListItemHistory:", error);
      return null;
    }
  }
}