export type PaymentMethodKey =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "MOBILE_PAYMENT"
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA_DEBITO"
  | "TARJETA_CREDITO"
  | "CHEQUE"
  | "RECARGO_MORA"
  | "TRANSFERENCIA_CREDITO"
  | "APLICACION_CREDITO";

export interface PaymentMethod {
  id: number;
  key: PaymentMethodKey;
  label: string;
}

export interface PaymentMethodOption {
  label: string;
  value: number;
  key: PaymentMethodKey;
}
