import { useState, useEffect, useCallback } from "react";
import { OrderOneOff, CreateOrderOneOffDTO } from "../interfaces/OrderOneOff";
import { OrderOneOffService } from "../services/OrderOneOffService";
import { ProductService } from "../services/ProductService";
import { CreateOrderPaymentDTO, OrderPaymentResponse } from "../interfaces/Order";


export const useOrdersOneOff = () => {
  const orderService = new OrderOneOffService();
  const productService = new ProductService();
  const [orders, setOrders] = useState<OrderOneOff[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderOneOff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
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
          setLimit(response.meta.limit || 15);
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

  const fetchOrderById = async (id: number): Promise<OrderOneOff | null> => {
    try {
      setIsLoading(true);
      const order = await orderService.getOrderOneOffById(id);
      return order;
    } catch (err: any) {
      setError(err?.message || "Error al obtener la orden");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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

  const productsOfOrderOneOff = async (orderId: number) => {
    try {
      setIsLoading(true);
      const order = await fetchOrderById(orderId);
      if (!order || !order.products) {
        throw new Error("No se encontraron productos en la orden");
      }

      const enrichedItems = await Promise.all(
        order.products.map(async (item) => {
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

  const processOneOffOrderPayment = async (
    orderId: number,
    payment: CreateOrderPaymentDTO
  ): Promise<OrderPaymentResponse> => {
    try {
      setIsLoading(true);
      const res = await orderService.processOneOffOrderPayment(orderId, payment);
      await fetchOrders(page, limit, search, filters, getSortParams());
      return res;
    } catch (err: any) {
      setError(err?.message || "Error al procesar pago de la orden One-Off");
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
    productsOfOrderOneOff,
    processOneOffOrderPayment,
    fetchOrderById
  };
};

export default useOrdersOneOff;