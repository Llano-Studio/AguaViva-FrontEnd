import { httpAdapter } from "./httpAdapter";
import { RegisterPaymentDTO, CyclePaymentsSummary, PaymentStats, Payment } from "../interfaces/PaymentSubscription";


export class PaymentSubscriptionService {
  private baseUrl = "/cycle-payments";

  async registerPayment(dto: RegisterPaymentDTO): Promise<Payment> {
    try {
      return await httpAdapter.post<Payment>(dto, this.baseUrl);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al registrar pago");
    }
  }

  async getCyclePayments(cycleId: number): Promise<CyclePaymentsSummary> {
    try {
      return await httpAdapter.get<CyclePaymentsSummary>(`${this.baseUrl}/cycle/${cycleId}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener pagos del ciclo");
    }
  }

  async getCustomerPayments(personId: number): Promise<CyclePaymentsSummary[]> {
    try {
      return await httpAdapter.get<CyclePaymentsSummary[]>(`${this.baseUrl}/customer/${personId}`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener pagos del cliente");
    }
  }

  async getPendingCycles(): Promise<CyclePaymentsSummary[]> {
    try {
      return await httpAdapter.get<CyclePaymentsSummary[]>(`${this.baseUrl}/pending`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener ciclos pendientes");
    }
  }

  async getOverdueCycles(): Promise<CyclePaymentsSummary[]> {
    try {
      return await httpAdapter.get<CyclePaymentsSummary[]>(`${this.baseUrl}/overdue`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener ciclos vencidos");
    }
  }

  async getStatistics(): Promise<PaymentStats> {
    try {
      return await httpAdapter.get<PaymentStats>(`${this.baseUrl}/statistics`);
    } catch (error: any) {
      throw new Error(error?.message || error?.response?.data?.message || "Error al obtener estadísticas de pagos");
    }
  }
}

export default PaymentSubscriptionService;