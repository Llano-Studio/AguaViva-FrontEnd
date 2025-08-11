export const paymentSemaphoreLabels: Record<string, string> = {
  GREEN: "Al dia",
  YELLOW: "Atrasado",
  RED: "Vencido",
  NONE: "-"
};

export const renderPaymentSemaphoreLabel = (value: string) => paymentSemaphoreLabels[value] || value;