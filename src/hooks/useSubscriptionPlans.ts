import { useState, useEffect, useCallback } from "react";
import { SubscriptionPlan, CreateSubscriptionPlanDTO } from "../interfaces/SubscriptionPlan";
import { SubscriptionPlanService } from "../services/SubscriptionPlanService";
import { cleanFilters } from "../utils/filterUtils";

export const useSubscriptionPlans = () => {
  const planService = new SubscriptionPlanService();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación, filtros y ordenamiento múltiple
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

  const fetchPlans = useCallback(
    async (
      pageParam = page,
      limitParam = limit,
      searchParam = search,
      filtersParam = filters,
      sortByParam = getSortParams()
    ) => {
      try {
        setIsLoading(true);
        
        // Limpiar filtros antes de enviar
        const cleanedFilters = cleanFilters(filtersParam);
        
        const response = await planService.getSubscriptionPlans({
          page: pageParam,
          limit: limitParam,
          search: searchParam,
          sortBy: sortByParam,
          ...cleanedFilters,
        });
        setPlans(response.data);
        setTotal(response.meta.total);
        setPage(response.meta.page);
        setLimit(response.meta.limit);
        setTotalPages(response.meta.totalPages);
        return true;
      } catch (err: any) {
        setError(err?.message || "Error al obtener abonos");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, search, filters, sortBy, sortDirection]
  );

  useEffect(() => {
    fetchPlans();
  }, [page, limit, search, filters, sortBy, sortDirection, fetchPlans]);

  const createSubscriptionPlan = async (planData: CreateSubscriptionPlanDTO) => {
    try {
      setIsLoading(true);
      const newPlan = await planService.createSubscriptionPlan(planData);
      if (newPlan) {
        await fetchPlans(page, limit, search, filters, getSortParams());
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al crear abono");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionPlan = async (id: number, planData: Partial<CreateSubscriptionPlanDTO>) => {
    try {
      setIsLoading(true);
      const updatedPlan = await planService.updateSubscriptionPlan(id, planData);
      if (updatedPlan) {
        await fetchPlans(page, limit, search, filters, getSortParams());
        setSelectedPlan(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err?.message || "Error al actualizar abono");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await planService.deleteSubscriptionPlan(id);
      await fetchPlans(page, limit, search, filters, getSortParams());
      setSelectedPlan(null);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error al eliminar abono");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    plans,
    selectedPlan,
    setSelectedPlan,
    isLoading,
    error,
    handleDelete,
    updateSubscriptionPlan,
    createSubscriptionPlan,
    refreshPlans: () => fetchPlans(page, limit, search, filters, getSortParams()),
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    fetchPlans,
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

export default useSubscriptionPlans;