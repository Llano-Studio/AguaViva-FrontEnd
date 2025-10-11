export const statusComodatoLabels: Record<string, string> = {
  ACTIVE: "Activo",
  RETURNED: "Devuelto",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
};

export const renderStatusComodatoLabel = (value: string) => statusComodatoLabels[value] || value;