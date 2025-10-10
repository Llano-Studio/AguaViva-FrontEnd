import { useState, useCallback } from "react";
import { RouteSheetService } from "../services/RouteSheetService";
import { RouteSheet, CreateRouteSheetDTO, UpdateRouteSheetDTO, RouteSheetsResponse } from "../interfaces/RouteSheet";

export const useRouteSheets = () => {
  const service = new RouteSheetService();
  const [routeSheets, setRouteSheets] = useState<RouteSheet[]>([]);
  const [selectedRouteSheet, setSelectedRouteSheet] = useState<RouteSheet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación, filtros y ordenamiento múltiple
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
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

  const fetchRouteSheets = useCallback(
    async (
        pageParam = page,
        limitParam = limit,
        searchParam = search,
        filtersParam = filters,
        sortByParam = getSortParams()
    ) => {
        setIsLoading(true);
        setError(null);
        try {
        // Solo incluir search si tiene valor
        const params: any = {
            page: pageParam,
            limit: limitParam,
            sortBy: sortByParam,
            ...filtersParam,
        };
        if (searchParam && searchParam.trim() !== "") {
            params.search = searchParam;
        }
        const response = await service.getRouteSheets(params);
        setRouteSheets(response.data);
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages || 1);
        setPage(response.meta.page || 1);
        setLimit(response.meta.limit || 15);
        return true;
        } catch (err: any) {
        setError(err.message || "Error al obtener hojas de ruta");
        return false;
        } finally {
        setIsLoading(false);
        }
    },
    [page, limit, search, filters, sortBy, sortDirection]
    );

  const createRouteSheet = async (data: CreateRouteSheetDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSheet = await service.createRouteSheet(data);
      await fetchRouteSheets(page, limit, search, filters, getSortParams());
      return newSheet;
    } catch (err: any) {
      setError(err?.message || "Error al crear hoja de ruta");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRouteSheet = async (id: number, data: UpdateRouteSheetDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSheet = await service.updateRouteSheet(id, data);
      await fetchRouteSheets(page, limit, search, filters, getSortParams());
      setSelectedRouteSheet(null);
      return updatedSheet;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar hoja de ruta");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRouteSheet = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await service.deleteRouteSheet(id);
      await fetchRouteSheets(page, limit, search, filters, getSortParams());
      setSelectedRouteSheet(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar hoja de ruta");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const printRouteSheet = async (params: { route_sheet_id: number; format: string; include_map?: boolean; include_signature_field?: boolean; include_product_details?: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await service.printRouteSheet(params);
      return result;
    } catch (err: any) {
      setError(err?.message || "Error al imprimir hoja de ruta");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    routeSheets,
    selectedRouteSheet,
    setSelectedRouteSheet,
    isLoading,
    error,
    createRouteSheet,
    updateRouteSheet,
    deleteRouteSheet,
    printRouteSheet,
    fetchRouteSheets,
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
  };
};

export default useRouteSheets;