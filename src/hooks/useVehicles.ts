import { useState, useEffect, useCallback } from "react";
import { Vehicle, CreateVehicleDTO } from "../interfaces/Vehicle";
import { VehicleService } from "../services/VehicleService";

export const useVehicles = () => {
  const vehicleService = new VehicleService();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

  const fetchVehicles = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        const response = await vehicleService.getVehicles({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...filtersParam,
        });
        setVehicles(response.data);
        setTotal(response.total);
        setPage(response.page);
        setLimit(response.limit);
        setTotalPages(response.totalPages);
        return true;
      } catch (err: any) {
        setError(err.message || "Error al obtener vehículos");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchVehicles();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchVehicles]);

  const createVehicle = async (vehicleData: CreateVehicleDTO) => {
    try {
      setIsLoading(true);
      const newVehicle = await vehicleService.createVehicle(vehicleData);
      if (newVehicle) {
        await fetchVehicles(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al crear vehículo');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVehicle = async (id: number, vehicleData: Partial<CreateVehicleDTO>) => {
    try {
      setIsLoading(true);
      const updatedVehicle = await vehicleService.updateVehicle(id, vehicleData);
      if (updatedVehicle) {
        await fetchVehicles(page, limit, search, filters, getSortParams());
        setSelectedVehicle(null);
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al actualizar vehículo');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await vehicleService.deleteVehicle(id);
      await fetchVehicles(page, limit, search, filters, getSortParams());
      setSelectedVehicle(null);
      return true;
    } catch (err) {
      setError('Error al eliminar vehículo');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    isLoading,
    error,
    handleDelete,
    updateVehicle,
    createVehicle,
    refreshVehicles: () => fetchVehicles(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchVehicles,
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

export default useVehicles;