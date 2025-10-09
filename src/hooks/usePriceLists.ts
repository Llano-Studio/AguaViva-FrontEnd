import { useState, useEffect, useCallback } from "react";
import {
  PriceList,
  CreatePriceListDTO,
  UpdatePriceListDTO,
  PriceListHistoryItem,
  PriceListHistoryListResponse,
  PaginatedMeta,
  UndoPriceUpdateRequest,
  UndoPriceUpdateResponse,
} from "../interfaces/PriceList";
import { PriceListService } from "../services/PriceListService";
import { cleanFilters } from "../utils/filterUtils";

export const usePriceLists = () => {
  const priceListService = new PriceListService();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [selectedPriceListItems, setSelectedPriceListItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Historial (lista e item)
  const [priceListHistory, setPriceListHistory] = useState<PriceListHistoryItem[]>([]);
  const [priceListHistoryMeta, setPriceListHistoryMeta] = useState<PaginatedMeta | null>(null);
  const [itemHistory, setItemHistory] = useState<PriceListHistoryItem[]>([]);
  const [itemHistoryMeta, setItemHistoryMeta] = useState<PaginatedMeta | null>(null);

  // Paginación, filtros y ordenamiento múltiple
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [sortBy, setSortBy] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<("asc" | "desc")[]>([]);

  const getSortParams = () => {
    return sortBy
      .map((field, idx) => (sortDirection[idx] === "desc" ? `-${field}` : field))
      .join(",");
  };

  const fetchPriceLists = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        const cleanedFilters = cleanFilters(filtersParam);
        const response = await priceListService.getPriceLists({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...cleanedFilters,
        });
        setPriceLists(response.data);
        setTotal(response.meta.total);
        setPage(response.meta.page);
        setLimit(response.meta.limit);
        setTotalPages(response.meta.totalPages);
        return true;
      } catch (err: any) {
        setError(err.message || "Error al obtener listas de precios");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchPriceLists();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchPriceLists]);

  const fetchPriceListById = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      const priceList = await priceListService.getPriceListById(id);
      setSelectedPriceList(priceList);
      setSelectedPriceListItems(priceList?.price_list_item || []);
      return priceList;
    } catch {
      setSelectedPriceList(null);
      setSelectedPriceListItems([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPriceList = async (data: CreatePriceListDTO) => {
    try {
      setIsLoading(true);
      const newList = await priceListService.createPriceList(data);
      if (newList) {
        await fetchPriceLists(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al crear lista de precios");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePriceList = async (id: number, data: UpdatePriceListDTO) => {
    try {
      setIsLoading(true);
      const updated = await priceListService.updatePriceList(id, data);
      if (updated) {
        await fetchPriceLists(page, limit, search, filters, getSortParams());
        setSelectedPriceList(null);
        setSelectedPriceListItems([]);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar lista de precios");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePriceList = async (id: number) => {
    try {
      setIsLoading(true);
      await priceListService.deletePriceList(id);
      await fetchPriceLists(page, limit, search, filters, getSortParams());
      setSelectedPriceList(null);
      setSelectedPriceListItems([]);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar lista de precios");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const applyPercentage = async (id: number, payload: { percentage: number; reason: string }) => {
    try {
      setIsLoading(true);
      const result = await priceListService.applyPercentage(id, payload);
      await fetchPriceListById(id);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al aplicar porcentaje");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Nuevo: obtener historial de una lista
  const fetchPriceListHistory = async (id: number, params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      const res = await priceListService.getPriceListHistory(id, params);
      setPriceListHistory(res?.data || []);
      setPriceListHistoryMeta(res?.meta || null);
      return res;
    } catch (err: any) {
      setError(err?.message || "Error al obtener historial de lista");
      setPriceListHistory([]);
      setPriceListHistoryMeta(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Nuevo: obtener historial de un item
  const fetchPriceListItemHistory = async (itemId: number, params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      const res = await priceListService.getPriceListItemHistory(itemId, params);
      setItemHistory(res?.data || []);
      setItemHistoryMeta(res?.meta || null);
      return res;
    } catch (err: any) {
      setError(err?.message || "Error al obtener historial de item");
      setItemHistory([]);
      setItemHistoryMeta(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Nuevo: deshacer actualizaciones de precio
  const undoPriceUpdate = async (payload: UndoPriceUpdateRequest): Promise<UndoPriceUpdateResponse | null> => {
    try {
      setIsLoading(true);
      const res = await priceListService.undoPriceUpdate(payload);
      // Opcional: refrescar historial de lista si se está visualizando una
      if (selectedPriceList?.price_list_id) {
        await fetchPriceListHistory(selectedPriceList.price_list_id, { page: priceListHistoryMeta?.page || 1, limit: priceListHistoryMeta?.limit || 10 });
      }
      return res;
    } catch (err: any) {
      setError(err?.message || "Error al deshacer actualizaciones de precios");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    priceLists,
    selectedPriceList,
    setSelectedPriceList,
    selectedPriceListItems,
    setSelectedPriceListItems,
    isLoading,
    error,

    // CRUD
    deletePriceList,
    updatePriceList,
    createPriceList,

    // Fetch
    fetchPriceListById,
    refreshPriceLists: () => fetchPriceLists(page, limit, search, filters, getSortParams()),
    fetchPriceLists,

    // Paging/filter/sort
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,

    // Extra
    applyPercentage,

    // Nuevo: historial y undo
    priceListHistory,
    priceListHistoryMeta,
    itemHistory,
    itemHistoryMeta,
    fetchPriceListHistory,
    fetchPriceListItemHistory,
    undoPriceUpdate,
  };
};