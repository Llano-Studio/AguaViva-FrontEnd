import { sortByOrder } from "../../utils/sortByOrder";

export const subscriptionPlanFilters = sortByOrder([
  {
    name: "is_active",
    label: "Activo",
    type: "checkbox" as const,
    order: 1,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
]);