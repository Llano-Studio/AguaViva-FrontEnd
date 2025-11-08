export type PaymentStatusKey =
  | "PAID"
  | "PENDING"
  | "PARTIAL"
  | "CREDITED"
  | "OVERDUE"
  | "CANCELLED";

const PAYMENT_STATUS_LABELS: Record<PaymentStatusKey, string> = {
  PAID: "PAGADO",
  PENDING: "PENDIENTE",
  PARTIAL: "PAGO PARCIAL",
  CREDITED: "CON CRÉDITO",
  OVERDUE: "VENCIDO",
  CANCELLED: "CANCELADO",
};

export const getPaymentStatusLabel = (key: PaymentStatusKey): string =>
  PAYMENT_STATUS_LABELS[key];

export const renderStatusPaymentLabel = (value: unknown): string => {
  const key = String(value ?? "").toUpperCase() as PaymentStatusKey;
  return (PAYMENT_STATUS_LABELS as any)[key] ?? (typeof value === "string" ? value : "-");
};