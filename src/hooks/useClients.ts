import { useState, useEffect, useCallback, useRef } from "react";
import { Client, CreateClientDTO, LoanedProduct, ChangeSubscriptionPlanDTO, CancelSubscriptionDTO } from "../interfaces/Client";
import { ClientService } from "../services/ClientService";
import { ProductService } from "../services/ProductService";
import { cleanFilters } from "../utils/filterUtils";
import { Comodato, CreateComodatoDTO, UpdateComodatoDTO } from "../interfaces/Comodato";

export const useClients = () => {
  // Mantener instancias estables para evitar recrear funciones (corta loops)
  const clientServiceRef = useRef(new ClientService());
  const productServiceRef = useRef(new ProductService());

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loanedProducts, setLoanedProducts] = useState<LoanedProduct[]>([]);
  const [comodatos, setComodatos] = useState<Comodato[]>([]);
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
        const cleanedFilters = cleanFilters(filtersParam);
        const params: any = {
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...cleanedFilters,
        };
        const response = await clientServiceRef.current.getClients(params);
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
      await clientServiceRef.current.createClient(clientData);
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
      const updatedClient = await clientServiceRef.current.updateClient(id, clientData);
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
      await clientServiceRef.current.deleteClient(id);
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
  const fetchLoanedProducts = useCallback(async (clientId: number) => {
    try {
      setIsLoading(true);
      const products = await clientServiceRef.current.getLoanedProducts(clientId);
    const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          const productDetails = await productServiceRef.current.getProductById(product.product_id);
          return {
            ...product,
            image: productDetails?.image_url || null,
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
  }, []);

  // Cancelar suscripción
  const cancelSubscription = useCallback(async (personId: number, subscriptionId: number, payload: CancelSubscriptionDTO) => {
    try {
      setIsLoading(true);
      const updatedClient = await clientServiceRef.current.cancelSubscription(personId, subscriptionId, payload);
      await fetchClients(page, limit, search, filters, getSortParams());
      return updatedClient;
    } catch (err: any) {
      setError(err?.message || "Error al cancelar la suscripción");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients, page, limit, search, filters]);

  // Cambiar plan de suscripción
  const changeSubscriptionPlan = useCallback(async (personId: number, payload: ChangeSubscriptionPlanDTO) => {
    try {
      setIsLoading(true);
      const updatedClient = await clientServiceRef.current.changeSubscriptionPlan(personId, payload);
      await fetchClients(page, limit, search, filters, getSortParams());
      return updatedClient;
    } catch (err: any) {
      setError(err?.message || "Error al cambiar el plan de suscripción");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchClients, page, limit, search, filters]);

  // Comodatos: crear (acepta FormData para soportar imágenes)
  const createComodato = useCallback(async (personId: number, payload: FormData | CreateComodatoDTO) => {
    try {
      setIsLoading(true);

      let body: FormData;
      if (payload instanceof FormData) {
        body = payload;
      } else {
        body = new FormData();
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (value instanceof Blob) {
            body.set(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((item, idx) => {
              if (item instanceof Blob) body.append(`${key}[${idx}]`, item);
              else body.append(`${key}[${idx}]`, String(item));
            });
          } else {
            body.set(key, String(value));
          }
        });
      }

      // algunos backends piden person_id también en el body
      body.set("person_id", String(personId));

      const created = await clientServiceRef.current.createComodato(personId, body);
      return created;
    } catch (err: any) {
      setError(err?.message || "Error al crear comodato");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Comodatos: listar por persona
  const fetchPersonComodatos = useCallback(async (personId: number) => {
    try {
      setIsLoading(true);
      const list = await clientServiceRef.current.getPersonComodatos(personId);
      setComodatos(list);
      return list;
    } catch (err: any) {
      setError(err?.message || "Error al obtener comodatos del cliente");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Comodatos: listar todos
  const fetchAllComodatos = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await clientServiceRef.current.getAllComodatos();
      setComodatos(list);
      return list;
    } catch (err: any) {
      setError(err?.message || "Error al obtener comodatos");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Comodatos: obtener por id
  const fetchComodatoById = useCallback(async (personId: number, comodatoId: number) => {
    try {
      setIsLoading(true);
      const c = await clientServiceRef.current.getComodatoById(personId, comodatoId);
      return c;
    } catch (err: any) {
      setError(err?.message || "Error al obtener el comodato");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Comodatos: actualizar
  const updateComodato = useCallback(async (personId: number, comodatoId: number, payload: UpdateComodatoDTO) => {
    try {
      setIsLoading(true);
      const updated = await clientServiceRef.current.updateComodato(personId, comodatoId, payload);
      return updated;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el comodato");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Comodatos: eliminar
  const deleteComodato = useCallback(async (personId: number, comodatoId: number) => {
    try {
      setIsLoading(true);
      const res = await clientServiceRef.current.deleteComodato(personId, comodatoId);
      return res;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar el comodato");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    // Nuevos (suscripción y comodatos)
    changeSubscriptionPlan,
    comodatos,
    setComodatos,
    createComodato,
    fetchPersonComodatos,
    fetchAllComodatos,
    fetchComodatoById,
    updateComodato,
    deleteComodato,
    // Paginación/filtros
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