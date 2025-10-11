import { useCallback, useRef, useState } from "react";
import PaymentSubscriptionService from "../services/PaymentSuscriptionService";
import { RegisterPaymentDTO, Payment, CyclePaymentsSummary, PaymentStats, } from "../interfaces/PaymentSubscription";

export const usePaymentSubscription = () => {
  const serviceRef = useRef(new PaymentSubscriptionService());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cyclePayments, setCyclePayments] = useState<CyclePaymentsSummary | null>(null);
  const [customerPayments, setCustomerPayments] = useState<CyclePaymentsSummary[] | null>(null);
  const [pendingCycles, setPendingCycles] = useState<CyclePaymentsSummary[] | null>(null);
  const [overdueCycles, setOverdueCycles] = useState<CyclePaymentsSummary[] | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);

  const registerPayment = useCallback(async (dto: RegisterPaymentDTO): Promise<Payment> => {
    try {
      setIsLoading(true);
      const payment = await serviceRef.current.registerPayment(dto);
      return payment;
    } catch (err: any) {
      const msg = err?.message || "Error al registrar pago";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCyclePayments = useCallback(async (cycleId: number) => {
    try {
      setIsLoading(true);
      const data = await serviceRef.current.getCyclePayments(cycleId);
      setCyclePayments(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || "Error al obtener pagos del ciclo";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCustomerPayments = useCallback(async (personId: number) => {
    try {
      setIsLoading(true);
      const data = await serviceRef.current.getCustomerPayments(personId);
      setCustomerPayments(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || "Error al obtener pagos del cliente";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPendingCycles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await serviceRef.current.getPendingCycles();
      setPendingCycles(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || "Error al obtener ciclos pendientes";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOverdueCycles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await serviceRef.current.getOverdueCycles();
      setOverdueCycles(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || "Error al obtener ciclos vencidos";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await serviceRef.current.getStatistics();
      setStats(data);
      return data;
    } catch (err: any) {
      const msg = err?.message || "Error al obtener estadísticas de pagos";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // state
    isLoading,
    error,
    cyclePayments,
    customerPayments,
    pendingCycles,
    overdueCycles,
    stats,

    // actions
    registerPayment,
    fetchCyclePayments,
    fetchCustomerPayments,
    fetchPendingCycles,
    fetchOverdueCycles,
    fetchStatistics,
  };
};

export default usePaymentSubscription;