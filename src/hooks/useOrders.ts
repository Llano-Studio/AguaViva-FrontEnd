import { useState, useEffect, useCallback } from "react";
import { Order, CreateOrderDTO, AvailableCredit } from "../interfaces/Order";
import { OrderService } from "../services/OrderService";
import { ClientSubscriptionService } from "../services/ClientSubscriptionService";

export const useOrders = () => {
  const orderService = new OrderService();
  const clientSubscriptionService = new ClientSubscriptionService();
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

  const fetchDeliveryPreferences = async (customer_id: number, subscription_id: number) => {
    console.log("entre a fetchDeliveryPreferences");
    try {
      console.log("fetchDeliveryPreferences customerId:", customer_id);
      const res = await clientSubscriptionService.getSubscriptionsByCustomer(customer_id);
      console.log("fetchDeliveryPreferences res:", res);
      const found = res.data?.find((sub: any) => sub.subscription_id === subscription_id);
      console.log("fetchDeliveryPreferences found:", found);
      return found?.delivery_preferences ?? null;
    } catch (err) {
      return null;
    }
  };

  const getAvailableCreditsBySubscription = async (subscriptionId: number): Promise<AvailableCredit[]> => {
    try {
      return await orderService.getAvailableCreditsBySubscription(subscriptionId);
    } catch (err: any) {
      setError(err?.message || "Error al obtener créditos disponibles");
      return [];
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
    fetchDeliveryPreferences,
    getAvailableCreditsBySubscription,
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