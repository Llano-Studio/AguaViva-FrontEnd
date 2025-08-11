import {
  PriceListItem,
  CreatePriceListItemDTO,
  UpdatePriceListItemDTO,
  PriceListItemResponse,
  PriceListItemsResponse,
} from "../interfaces/PriceListItem";
import { httpAdapter } from "./httpAdapter";

export class PriceListItemService {
  private baseUrl = "/price-list-item";

  async create(data: CreatePriceListItemDTO): Promise<PriceListItemResponse> {
    return await httpAdapter.post<PriceListItemResponse>(data, this.baseUrl);
  }

  async getAll(): Promise<PriceListItemsResponse> {
    return await httpAdapter.get<PriceListItemsResponse>(this.baseUrl);
  }

  async getByList(priceListId: number): Promise<PriceListItemsResponse> {
    return await httpAdapter.get<PriceListItemsResponse>(`${this.baseUrl}/by-list/${priceListId}`);
  }

  async getById(id: number): Promise<PriceListItemResponse> {
    return await httpAdapter.get<PriceListItemResponse>(`${this.baseUrl}/${id}`);
  }

  async update(id: number, data: UpdatePriceListItemDTO): Promise<PriceListItemResponse> {
    return await httpAdapter.patch<PriceListItemResponse>(data, `${this.baseUrl}/${id}`);
  }

  async delete(id: number): Promise<{ message: string; deleted: boolean }> {
    return await httpAdapter.delete<{ message: string; deleted: boolean }>(`${this.baseUrl}/${id}`);
  }
}