import { useState, useEffect, useCallback } from "react";
import { Zone } from "../interfaces/Locations";
import { ZoneService, CreateZoneDTO } from "../services/ZoneService";

export const useZones = () => {
  const zoneService = new ZoneService();
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
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

  const fetchZones = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        const response = await zoneService.getZones({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...filtersParam,
        });
        setZones(response.data);
        setTotal(response.meta.total);
        setPage(response.meta.page);
        setLimit(response.meta.limit);
        setTotalPages(response.meta.totalPages);
        return true;
      } catch (err: any) {
        setError(err.message || "Error al obtener zonas");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchZones();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchZones]);

  const createZone = async (zoneData: CreateZoneDTO) => {
    try {
      setIsLoading(true);
      const newZone = await zoneService.createZone(zoneData);
      if (newZone) {
        await fetchZones(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al crear zona');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateZone = async (id: number, zoneData: Partial<CreateZoneDTO>) => {
    try {
      setIsLoading(true);
      const updatedZone = await zoneService.updateZone(id, zoneData);
      if (updatedZone) {
        await fetchZones(page, limit, search, filters, getSortParams());
        setSelectedZone(null);
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al actualizar zona');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await zoneService.deleteZone(id);
      await fetchZones(page, limit, search, filters, getSortParams());
      setSelectedZone(null);
      return true;
    } catch (err) {
      setError('Error al eliminar zona');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    zones,
    selectedZone,
    setSelectedZone,
    isLoading,
    error,
    handleDelete,
    updateZone,
    createZone,
    refreshZones: () => fetchZones(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchZones,
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

export default useZones;