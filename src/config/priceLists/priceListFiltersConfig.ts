import { sortByOrder } from "../../utils/sortByOrder";

export const priceListFilters = sortByOrder([
  {
    name: "name",
    label: "Nombre",
    type: "text" as const,
    order: 1,
  },
  {
    name: "effective_date",
    label: "Fecha de vigencia",
    type: "date" as const,
    order: 2,
  },
  {
    name: "active",
    label: "Activa",
    type: "checkbox" as const,
    order: 3,
  },
]);