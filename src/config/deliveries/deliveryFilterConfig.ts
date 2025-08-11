import { sortByOrder } from "../../utils/sortByOrder";

export const deliveryFilters = sortByOrder([
  {
    name: "status",
    label: "Estado",
    type: "select" as const,
    options: [
      { label: "Pendiente", value: "PENDING" },
      { label: "En preparación", value: "IN_PREPARATION" },
      { label: "En entrega", value: "IN_DELIVERY" },
      { label: "Entregado", value: "DELIVERED" },
      { label: "Cancelado", value: "CANCELLED" },
    ],
    order: 1,
  },
]);