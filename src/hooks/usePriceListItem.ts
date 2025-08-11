import { useState } from "react";
import {
  PriceListItem,
  CreatePriceListItemDTO,
  UpdatePriceListItemDTO,
} from "../interfaces/PriceListItem";
import { PriceListItemService } from "../services/PriceListItemService";

export function usePriceListItems(priceListId: number) {
  const service = new PriceListItemService();
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await service.getByList(priceListId);
      setItems(res.data);
    } catch (err: any) {
      setError(err.message || "Error al obtener items");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (data: CreatePriceListItemDTO) => {
    setLoading(true);
    setError(null);
    try {
      const res = await service.create(data);
      await fetchItems();
      return res;
    } catch (err: any) {
      setError(err.message || "Error al agregar item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, data: UpdatePriceListItemDTO) => {
    setLoading(true);
    setError(null);
    try {
      const res = await service.update(id, data);
      await fetchItems();
      return res;
    } catch (err: any) {
      setError(err.message || "Error al actualizar item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await service.delete(id);
      await fetchItems();
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar item");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    removeItem,
  };
}