export const statusPaymentOrderLabels: Record<string, string> = {
  NONE: "-",
  PENDING: "Pendiente",
  PAID: "Pagado",
  PARTIAL: "Parcial",
};

export const renderStatusPaymentOrderLabel = (value: string) => statusPaymentOrderLabels[value] || value;