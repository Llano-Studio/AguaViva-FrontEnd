import { useCallback, useRef, useState } from "react";
import AutomatedCollectionOrderService from "../services/AutomatedCollectionOrderService";
import type {
  GeneratedRouteSheetFile,
  GeneratedRouteSheetListResponse,
  GeneratedRouteSheetQuery,
} from "../interfaces/AutomatedCollectionOrder";

export const useAutomatedCollectionOrder = () => {
  const serviceRef = useRef(new AutomatedCollectionOrderService());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<GeneratedRouteSheetFile[]>([]);
  const [total, setTotal] = useState<number>(0);

  const lastQueryRef = useRef<GeneratedRouteSheetQuery | undefined>(undefined);

  const fetchGeneratedRouteSheets = useCallback(
    async (query?: GeneratedRouteSheetQuery): Promise<GeneratedRouteSheetListResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);
        lastQueryRef.current = query;
        const res = await serviceRef.current.getGeneratedRouteSheets(query);
        setItems(res?.data || []);
        setTotal(res?.total || 0);
        return res;
      } catch (err: any) {
        const msg = err?.message || "Error al obtener planillas de ruta generadas";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    return fetchGeneratedRouteSheets(lastQueryRef.current);
  }, [fetchGeneratedRouteSheets]);

  return {
    isLoading,
    error,
    items,
    total,
    fetchGeneratedRouteSheets,
    refresh,
  };
};

export default useAutomatedCollectionOrder;