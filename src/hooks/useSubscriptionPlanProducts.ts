import { useState } from "react";
import { SubscriptionPlanService } from "../services/SubscriptionPlanService";
import { SubscriptionPlan, AddProductToPlanDTO, UpdateProductQuantityDTO, AdjustProductQuantitiesDTO, AdjustPricesDTO } from "../interfaces/SubscriptionPlan";

export const useSubscriptionPlanProducts = (planId: number) => {
  const service = new SubscriptionPlanService();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = async (data: AddProductToPlanDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await service.addProductToPlan(planId, data);
      setPlan(updatedPlan);
      return updatedPlan;
    } catch (err: any) {
      setError(err.message || "Error al agregar producto");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProductQuantity = async (productId: number, data: UpdateProductQuantityDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await service.updateProductQuantity(planId, productId, data);
      setPlan(updatedPlan);
      return updatedPlan;
    } catch (err: any) {
      setError(err.message || "Error al actualizar cantidad");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await service.removeProductFromPlan(planId, productId);
      setPlan(updatedPlan);
      return updatedPlan;
    } catch (err: any) {
      setError(err.message || "Error al eliminar producto");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const adjustProductQuantities = async (data: AdjustProductQuantitiesDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await service.adjustProductQuantities(planId, data);
      setPlan(updatedPlan);
      return updatedPlan;
    } catch (err: any) {
      setError(err.message || "Error al ajustar cantidades");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    plan,
    setPlan,
    loading,
    error,
    addProduct,
    updateProductQuantity,
    removeProduct,
    adjustProductQuantities,
  };
};

// Hook para ajuste global de precios
export const useAdjustSubscriptionPlanPrices = () => {
  const service = new SubscriptionPlanService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; updated_count: number } | null>(null);

  const adjustPrices = async (data: AdjustPricesDTO) => {
    setLoading(true);
    setError(null);
    try {
      const res = await service.adjustAllPrices(data);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err.message || "Error al ajustar precios");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { adjustPrices, loading, error, result };
};