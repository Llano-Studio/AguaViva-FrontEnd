import { useState, useEffect, useCallback } from "react";
import { OrderOneOff, CreateOrderOneOffDTO } from "../interfaces/OrderOneOff";
import { OrderOneOffService } from "../services/OrderOneOffService";

export const useOrdersOneOff = () => {
  const orderService = new OrderOneOffService();
  const [orders, setOrders] = useState<OrderOneOff[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderOneOff | null>(null);
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
        const response = await orderService.getOrdersOneOff({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...filtersParam,
        });
        if (response?.data) {
          setOrders(response.data);
          setTotal(response.meta.total);
          setTotalPages(response.meta.totalPages ?? 1);
          setPage(response.meta.page || 1);
          setLimit(response.meta.limit || 10);
          return true;
        }
        return false;
      } catch (err: any) {
        setError(err.message || "Error al obtener órdenes One-Off");
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

  const createOrder = async (orderData: CreateOrderOneOffDTO) => {
    try {
      setIsLoading(true);
      const newOrder = await orderService.createOrderOneOff(orderData);
      await fetchOrders(page, limit, search, filters, getSortParams());
      return newOrder;
    } catch (err: any) {
      setError(err?.message || "Error al crear orden One-Off");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrder = async (id: number, orderData: CreateOrderOneOffDTO) => {
    try {
      setIsLoading(true);
      const updatedOrder = await orderService.updateOrderOneOff(id, orderData);
      await fetchOrders(page, limit, search, filters, getSortParams());
      return updatedOrder;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar orden One-Off");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      setIsLoading(true);
      const result = await orderService.deleteOrderOneOff(id);
      await fetchOrders(page, limit, search, filters, getSortParams());
      setSelectedOrder(null);
      return result;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar orden One-Off");
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
    createOrder,
    updateOrder,
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

export default useOrdersOneOff;