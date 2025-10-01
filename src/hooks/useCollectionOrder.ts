import { useCallback, useRef, useState } from "react";
import { CollectionOrderService } from "../services/CollectionOrderService";
import {
  ManualCollectionGenerateDTO,
  ManualCollectionGenerateResponse,
  ManualCollectionPendingCycle,
  ManualCollectionPendingCyclesResponse,
  ManualCollectionCustomerInfo,
} from "../interfaces/CollectionOrder";

export const useCollectionOrder = () => {
  const serviceRef = useRef(new CollectionOrderService());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState<ManualCollectionCustomerInfo | null>(null);
  const [pendingCycles, setPendingCycles] = useState<ManualCollectionPendingCycle[]>([]);
  const [totalPending, setTotalPending] = useState<number>(0);

  const fetchPendingCycles = useCallback(
    async (customerId: number): Promise<ManualCollectionPendingCyclesResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await serviceRef.current.getPendingCyclesByCustomer(customerId);
        setCustomerInfo(res.customer_info);
        setPendingCycles(res.pending_cycles || []);
        setTotalPending(res.total_pending || 0);
        return res;
      } catch (err: any) {
        const msg = err?.message || "Error al obtener ciclos pendientes";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generateCollectionOrder = useCallback(
    async (payload: ManualCollectionGenerateDTO): Promise<ManualCollectionGenerateResponse> => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await serviceRef.current.generate(payload);
        return res;
      } catch (err: any) {
        const msg = err?.message || "Error al generar pedido de cobranza";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetState = () => {
    setCustomerInfo(null);
    setPendingCycles([]);
    setTotalPending(0);
    setError(null);
  };

  return {
    // estado
    isLoading,
    error,
    customerInfo,
    pendingCycles,
    totalPending,
    // acciones
    fetchPendingCycles,
    generateCollectionOrder,
    resetState,
  };
};

export default useCollectionOrder;