import { useState, useEffect, useCallback } from "react";
import { PriceList, CreatePriceListDTO, UpdatePriceListDTO } from "../interfaces/PriceList";
import { PriceListService } from "../services/PriceListService";
import { cleanFilters } from "../utils/filterUtils";

export const usePriceLists = () => {
  const priceListService = new PriceListService();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [selectedPriceListItems, setSelectedPriceListItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        // Limpiar filtros antes de enviar
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

  // Nuevo: obtener una lista de precios por ID y exponer sus items
  const fetchPriceListById = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      const priceList = await priceListService.getPriceListById(id);
      setSelectedPriceList(priceList);
      // Soporta ambas variantes: price_list_item (singular) y price_list_items (plural)
      setSelectedPriceListItems(
        priceList?.price_list_item || []
      );
      return priceList;
    } catch (err) {
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
      // Opcional: refresca la lista seleccionada
      await fetchPriceListById(id);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al aplicar porcentaje");
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
    deletePriceList,
    updatePriceList,
    createPriceList,
    fetchPriceListById,
    refreshPriceLists: () => fetchPriceLists(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchPriceLists,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    applyPercentage,
  };
};