import { useState, useEffect, useCallback } from "react";
import { Order, CreateOrderDTO } from "../interfaces/Order";
import { OrderService } from "../services/OrderService";

export const useOrders = () => {
  const orderService = new OrderService();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const fetchOrders = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        const response = await orderService.getOrders({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...filtersParam,
        });
        if (response?.data) {
          setOrders(response.data);
          setTotal(response.meta.total);
          setTotalPages(response.meta.totalPages || 1);
          setPage(response.meta.page || 1);
          setLimit(response.meta.limit || 10);
          return true;
        }
        return false;
      } catch (err: any) {
        setError(err.message || "Error al obtener órdenes");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchOrders]);

  const createOrder = async (orderData: CreateOrderDTO) => {
    try {
      setIsLoading(true);
      const newOrder = await orderService.createOrder(orderData);
      await fetchOrders(page, limit, search, filters, getSortParams());
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al crear orden");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrder = async (id: number, orderData: Partial<CreateOrderDTO>) => {
    try {
      setIsLoading(true);
      const updatedOrder = await orderService.updateOrder(id, orderData);
      if (updatedOrder) {
        await fetchOrders(page, limit, search, filters, getSortParams());
        setSelectedOrder(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar orden");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      setIsLoading(true);
      await orderService.deleteOrder(id);
      await fetchOrders(page, limit, search, filters, getSortParams());
      setSelectedOrder(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar orden");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    selectedOrder,
    setSelectedOrder,
    isLoading,
    error,
    deleteOrder,
    updateOrder,
    createOrder,
    refreshOrders: () => fetchOrders(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchOrders,
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

export default useOrders;