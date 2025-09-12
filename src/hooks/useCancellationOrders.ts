import { useCallback, useRef, useState } from "react";
import CancellationOrderService from "../services/CancellationOrderService";
import {
  CancellationOrder,
  CreateCancellationOrderDTO,
  CancellationOrderQueryParams,
} from "../interfaces/CancellationOrder";

export const useCancellationOrders = () => {
  const serviceRef = useRef(new CancellationOrderService());

  const [orders, setOrders] = useState<CancellationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación simple opcional (si backend soporta)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const fetchOrders = useCallback(
    async (params: CancellationOrderQueryParams = {}) => {
      try {
        setIsLoading(true);
        setError(null);
        const merged: CancellationOrderQueryParams = {
          page,
            limit,
          ...params,
        };
        const data = await serviceRef.current.list(merged);
        setOrders(Array.isArray(data) ? data : []);
        return data;
      } catch (err: any) {
        const msg = err?.message || "Error al obtener órdenes";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit]
  );

  const createOrder = useCallback(async (dto: CreateCancellationOrderDTO) => {
    try {
      setIsLoading(true);
      setError(null);
      const created = await serviceRef.current.create(dto);
      // Refrescar lista manteniendo filtros actuales básicos
      await fetchOrders();
      return created;
    } catch (err: any) {
      const msg = err?.message || "Error al crear orden de cancelación";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrders]);

  return {
    // state
    orders,
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    // actions
    fetchOrders,
    createOrder,
  };
};

export default useCancellationOrders;