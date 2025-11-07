import { useCallback, useRef, useState } from "react";
import AutomatedCollectionOrderService from "../services/AutomatedCollectionOrderService";
import type {
  GeneratedRouteSheetFile,
  GeneratedRouteSheetListResponse,
  GeneratedRouteSheetQuery,
  GenerateCollectionPdfBody,
  GenerateCollectionPdfResponse,
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

  const generateCollectionPdf = useCallback(
    async (routeSheetId: number, body?: GenerateCollectionPdfBody): Promise<GenerateCollectionPdfResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await serviceRef.current.generateCollectionPDF(routeSheetId, body);
        return res;
      } catch (err: any) {
        const msg = err?.message || "Error al generar PDF de cobranzas automáticas";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    items,
    total,
    fetchGeneratedRouteSheets,
    refresh,
    generateCollectionPdf,
  };
};

export default useAutomatedCollectionOrder;