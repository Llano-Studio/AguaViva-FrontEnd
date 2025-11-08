import type { PaymentMethodOption, PaymentMethodKey } from "../interfaces/PaymentMethod";

export const DEFAULT_PAYMENT_METHODS: PaymentMethodOption[] = [
  { label: "Efectivo", value: 1, key: "EFECTIVO" },
  { label: "Transferencia", value: 2, key: "TRANSFERENCIA" },
  { label: "Tarjeta de Debito", value: 3, key: "TARJETA_DEBITO" },
  { label: "Tarjeta de Crédito", value: 4, key: "TARJETA_CREDITO" },
  { label: "Cheque", value: 5, key: "CHEQUE" },
  { label: "Mercado Pago", value: 6, key: "MERCADO_PAGO" },
];

export const getPaymentMethods = (): PaymentMethodOption[] => DEFAULT_PAYMENT_METHODS;

export const getPaymentMethodLabel = (value: number): string =>
  DEFAULT_PAYMENT_METHODS.find((m) => m.value === value)?.label ?? "";

export const getPaymentMethodKey = (value: number): PaymentMethodKey | "" =>
  DEFAULT_PAYMENT_METHODS.find((m) => m.value === value)?.key ?? "";

export const getPaymentMethodKeyOptions = (): Array<{ label: string; value: PaymentMethodKey }> =>
  DEFAULT_PAYMENT_METHODS.map((m) => ({ label: m.label, value: m.key }));