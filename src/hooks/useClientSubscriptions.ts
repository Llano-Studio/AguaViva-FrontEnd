import { useState, useCallback } from "react";
import { ClientSubscriptionService } from "../services/ClientSubscriptionService";

export const useClientSubscriptions = () => {
  const service = new ClientSubscriptionService();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async (params?: any) => {
    setIsLoading(true);
    try {
      const res = await service.getSubscriptions(params);
      setSubscriptions(res.data || []);
      return res;
    } catch (err: any) {
      setError(err.message || "Error al obtener suscripciones");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubscriptionsByCustomer = useCallback(async (customerId: number, params?: any) => {
    setIsLoading(true);
    try {
      const res = await service.getSubscriptionsByCustomer(customerId, params);
      setSubscriptions(res.data || []);
      console.log("Suscripciones del cliente:", res.data); 
      return res;
    } catch (err: any) {
      setError(err.message || "Error al obtener suscripciones del cliente");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubscription = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await service.createSubscription(data);
      return res;
    } catch (err: any) {
      setError(err.message || "Error al crear suscripción");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (id: number, data: any) => {
    setIsLoading(true);
    try {
      const res = await service.updateSubscription(id, data);
      return res;
    } catch (err: any) {
      setError(err.message || "Error al actualizar suscripción");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscription = async (id: number) => {
    setIsLoading(true);
    try {
      await service.deleteSubscription(id);
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar suscripción");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    fetchSubscriptionsByCustomer,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  };
};

export default useClientSubscriptions;