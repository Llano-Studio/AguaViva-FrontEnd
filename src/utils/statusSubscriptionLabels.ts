export const statusSubscriptionLabels: Record<string, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
  EXPIRED: "Vencido",
};

export const renderStatusSubscriptionLabel = (value: string) =>
  statusSubscriptionLabels[value] || value;