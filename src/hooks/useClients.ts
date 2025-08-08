import { useState, useEffect, useCallback } from "react";
import { Client, CreateClientDTO, LoanedProduct } from "../interfaces/Client";
import { ClientService } from "../services/ClientService";
import { ProductService } from "../services/ProductService";

export const useClients = () => {
  const clientService = new ClientService();
  const productService = new ProductService(); // Instancia del servicio de productos
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loanedProducts, setLoanedProducts] = useState<LoanedProduct[]>([]);
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
        
        if (response?.data) {
          setClients(response.data);
          setTotal(response.meta.total);           
          setTotalPages(response.meta.totalPages || 1); 
          setPage(response.meta.page || 1);       
          setLimit(response.meta.limit || 10);    
          return true;
        }
        return false;
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
      await fetchClients(page, limit, search, filters, getSortParams());
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al crear cliente");
      throw err;
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
    } catch (err: any) {
      setError(err?.message || "Error al actualizar cliente");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClient = async (id: number) => {
    try {
      setIsLoading(true);
      await clientService.deleteClient(id);
      await fetchClients(page, limit, search, filters, getSortParams());
      setSelectedClient(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar cliente");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener productos en comodato y enriquecerlos con detalles del producto
  const fetchLoanedProducts = async (clientId: number) => {
    try {
      setIsLoading(true);
      const products = await clientService.getLoanedProducts(clientId);

      // Enriquecer productos con detalles (como imagen)
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          const productDetails = await productService.getProductById(product.product_id);
          return {
            ...product,
            image: productDetails?.image_url || null, // Agregar imagen si está disponible
          };
        })
      );

      setLoanedProducts(enrichedProducts);
      return enrichedProducts;
    } catch (err: any) {
      setError(err?.message || "Error al obtener productos en comodato");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar suscripción
  const cancelSubscription = async (personId: number, subscriptionId: number) => {
    try {
      setIsLoading(true);
      const updatedClient = await clientService.cancelSubscription(personId, subscriptionId);
      await fetchClients(page, limit, search, filters, getSortParams());
      return updatedClient;
    } catch (err: any) {
      setError(err?.message || "Error al cancelar la suscripción");
      throw err;
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
    deleteClient,
    updateClient,
    createClient,
    fetchLoanedProducts,
    loanedProducts,
    cancelSubscription,
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