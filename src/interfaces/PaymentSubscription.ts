import type { PaymentMethodKey } from "./PaymentMethod";

export interface RegisterPaymentDTO {
  cycle_id: number;
  amount: number;
  payment_method: PaymentMethodKey; 
  payment_date: string; 
  reference?: string;
  notes?: string;
}

export interface Payment {
  payment_id: number;
  cycle_id: number;
  payment_date: string; // ISO
  amount: number;
  payment_method: PaymentMethodKey;
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
  payment_status: string; 
  payment_due_date: string; 
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

export interface UpdatePaymentDTO {
  amount: number;
  payment_method: PaymentMethodKey; 
  payment_date: string; 
  reference?: string;
  notes?: string;
}

export interface DeletePaymentDTO {
  confirmation_code?: string;
  reason?: string;
}

export interface AuditMetadata {
  operation_type: string; 
  timestamp: string; 
  affected_records: number;
}

export interface UpdatePaymentResponse {
  success: boolean;
  message: string;
  audit_id: number;
  data: Payment;
  metadata: AuditMetadata;
}

export interface DeletePaymentResponse {
  success: boolean;
  message: string;
  audit_id: number;
  metadata: AuditMetadata;
}