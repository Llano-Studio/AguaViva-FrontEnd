import { sortByOrder } from "../../utils/sortByOrder";

export const vehicleFilters = sortByOrder([
  {
    name: "code",
    label: "Código",
    type: "text" as const,
    order: 1,
  },
  {
    name: "name",
    label: "Nombre",
    type: "text" as const,
    order: 2,
  },
]);