import { useState, useEffect, useCallback } from "react";
import { Client, CreateClientDTO } from "../interfaces/Client";
import { ClientService } from "../services/ClientService";

export const useClients = () => {
  const clientService = new ClientService();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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

  const fetchClients = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        const response = await clientService.getClients({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...filtersParam,
        });
        setClients(response.data);
        setTotal(response.total);
        setPage(response.page);
        setLimit(response.limit);
        setTotalPages(response.totalPages);
        return true;
      } catch (err: any) {
        setError(err.message || "Error al obtener clientes");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchClients();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchClients]);

  const createClient = async (clientData: CreateClientDTO) => {
    try {
      setIsLoading(true);
      const newClient = await clientService.createClient(clientData);
      if (newClient) {
        await fetchClients(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al crear cliente');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClient = async (id: number, clientData: Partial<CreateClientDTO>) => {
    try {
      setIsLoading(true);
      const updatedClient = await clientService.updateClient(id, clientData);
      if (updatedClient) {
        await fetchClients(page, limit, search, filters, getSortParams());
        setSelectedClient(null);
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al actualizar cliente');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await clientService.deleteClient(id);
      await fetchClients(page, limit, search, filters, getSortParams());
      setSelectedClient(null);
      return true;
    } catch (err) {
      setError('Error al eliminar cliente');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    selectedClient,
    setSelectedClient,
    isLoading,
    error,
    handleDelete,
    updateClient,
    createClient,
    refreshClients: () => fetchClients(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchClients,
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

export default useClients;