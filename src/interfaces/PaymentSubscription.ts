export type PaymentMethod = string; // "EFECTIVO" | "TRANSFERENCIA" | etc.

export interface RegisterPaymentDTO {
  cycle_id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string; // ISO string
  reference?: string;
  notes?: string;
}

export interface Payment {
  payment_id: number;
  cycle_id: number;
  payment_date: string; // ISO
  amount: number;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_by: number;
}

export interface CyclePaymentsSummary {
  cycle_id: number;
  total_amount: number;
  paid_amount: number;
  pending_balance: number;
  credit_balance: number;
  payment_status: string; // "PAGADO" | "PENDIENTE" | "PARCIAL" | etc.
  payment_due_date: string; // ISO
  payments: Payment[];
}

export interface PaymentStats {
  total_cycles: number;
  paid_cycles: number;
  pending_cycles: number;
  overdue_cycles: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
}