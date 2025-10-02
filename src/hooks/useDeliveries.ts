import { useState, useEffect, useCallback } from "react";
import { Delivery, CreateDeliveryDTO } from "../interfaces/Deliveries";
import { OrderService } from "../services/OrderService";
import { OrderOneOffService } from "../services/OrderOneOffService";

export const useDeliveries = () => {
  const orderService = new OrderService();
  const oneOffService = new OrderOneOffService();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Traer REGULARES + ONE_OFF(requires_delivery=true) y combinarlos
  const fetchDeliveries = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);

        // Pedimos ambas listas en paralelo
        const [regularRes, oneOffRes] = await Promise.all([
          orderService.getOrders({
            page: 1, // pedimos desde el inicio para luego combinar y paginar localmente
            limit: limitParam, // podés aumentar si querés más margen antes de cortar
            search: searchParam,
            sortBy: sortByParam,
            ...filtersParam,
            order_type: "HYBRID",
          }),
          oneOffService.getOrdersOneOff({
            page: 1,
            limit: limitParam,
            search: searchParam,
            sortBy: sortByParam,
            ...filtersParam,
            order_type: "ONE_OFF",
            requires_delivery: true, // solo ONE_OFF con envío
          }),
        ]);

        const regularData = regularRes?.data ?? [];
        const oneOffData = oneOffRes?.data ?? [];

        const combined = [...regularData, ...oneOffData];

        // Paginación local sobre la combinación
        const totalCombined =
          (regularRes?.meta?.total ?? regularData.length) +
          (oneOffRes?.meta?.total ?? oneOffData.length);

        const totalPagesCombined = Math.max(1, Math.ceil(totalCombined / limitParam));
        const startIdx = (pageParam - 1) * limitParam;
        const endIdx = startIdx + limitParam;
        const paginated = combined.slice(startIdx, endIdx);

        setDeliveries(paginated as any);
        setTotal(totalCombined);
        setTotalPages(totalPagesCombined);
        setPage(pageParam);
        setLimit(limitParam);

        return true;
      } catch (err: any) {
        setError(err.message || "Error al obtener entregas");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchDeliveries();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchDeliveries]);

  const createDelivery = async (deliveryData: CreateDeliveryDTO) => {
    try {
      setIsLoading(true);
      // Puedes adaptar esto según tu backend, aquí se usa createOrder
      await orderService.createOrder(deliveryData as any);
      await fetchDeliveries(page, limit, search, filters, getSortParams());
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al crear entrega");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDelivery = async (id: number, deliveryData: Partial<CreateDeliveryDTO>) => {
    try {
      setIsLoading(true);
      const updatedDelivery = await orderService.updateOrder(id, deliveryData as any);
      if (updatedDelivery) {
        await fetchDeliveries(page, limit, search, filters, getSortParams());
        setSelectedDelivery(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar entrega");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDelivery = async (id: number) => {
    try {
      setIsLoading(true);
      await orderService.deleteOrder(id);
      await fetchDeliveries(page, limit, search, filters, getSortParams());
      setSelectedDelivery(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar entrega");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deliveries,
    selectedDelivery,
    setSelectedDelivery,
    isLoading,
    error,
    deleteDelivery,
    updateDelivery,
    createDelivery,
    refreshDeliveries: () => fetchDeliveries(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchDeliveries,
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

export default useDeliveries;