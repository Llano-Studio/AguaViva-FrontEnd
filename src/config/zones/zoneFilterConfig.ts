import { sortByOrder } from "../../utils/sortByOrder";

export const zoneFilters = sortByOrder([
  {
    name: "name",
    label: "Nombre",
    type: "text" as const,
    order: 1,
  },
  {
    name: "code",
    label: "Código",
    type: "text" as const,
    order: 2,
  },
]);