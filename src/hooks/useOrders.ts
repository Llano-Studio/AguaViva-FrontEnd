import { useState, useEffect, useCallback } from "react";
import { Order, CreateOrderDTO, AvailableCredit } from "../interfaces/Order";
import { OrderService } from "../services/OrderService";
import { ClientSubscriptionService } from "../services/ClientSubscriptionService";
import { ProductService } from "../services/ProductService";

export const useOrders = () => {
  const orderService = new OrderService();
  const clientSubscriptionService = new ClientSubscriptionService();
  const productService = new ProductService(); // Instancia del servicio de productos
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

  const fetchOrderById = async (id: number): Promise<Order | null> => {
    try {
      setIsLoading(true);
      const order = await orderService.getOrderById(id);
      return order;
    } catch (err: any) {
      setError(err?.message || "Error al obtener la orden");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const productsOfOrder = async (orderId: number) => {
    try {
      setIsLoading(true);
      const order = await fetchOrderById(orderId);
      if (!order || !order.order_item) {
        throw new Error("No se encontraron productos en la orden");
      }

      const enrichedItems = await Promise.all(
        order.order_item.map(async (item) => {
          const imageUrl = await productService.getProductImage(item.product_id);
          return {
            ...item,
            image_url: imageUrl || null,
          };
        })
      );

      return enrichedItems;
    } catch (err: any) {
      setError(err?.message || "Error al obtener productos de la orden");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryPreferences = async (customer_id: number, subscription_id: number) => {
    try {
      const res = await clientSubscriptionService.getSubscriptionsByCustomer(customer_id);
      const found = res.data?.find((sub: any) => sub.subscription_id === subscription_id);
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
    fetchOrderById,
    productsOfOrder,
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