export type PaymentMethodKey = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "CHEQUE" | "MERCADO_PAGO";

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