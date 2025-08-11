import { sortByOrder } from "../../utils/sortByOrder";

export const priceListFilters = sortByOrder([
  {
    name: "active",
    label: "Activa",
    type: "checkbox" as const,
    order: 1,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
  {
    name: "is_default",
    label: "Por defecto",
    type: "checkbox" as const,
    order: 2,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
]);