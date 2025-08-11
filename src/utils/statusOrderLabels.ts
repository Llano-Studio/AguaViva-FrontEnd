export const statusOrderLabels: Record<string, string> = {
  PENDING: "Pendiente",
  DELIVERED: "Entregado",
  CONFIRMED: "Confirmado",
  IN_PREPARATION: "En preparación",
  READY_FOR_DELIVERY: "Listo para entrega",
  IN_DELIVERY: "En entrega",
  RETIRADO: "Retirado",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado"
};

export const renderStatusOrderLabel = (value: string) => statusOrderLabels[value] || value;