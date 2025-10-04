import { sortByOrder } from "../../utils/sortByOrder";
import { ROLE_OPTIONS } from "../../utils/roleLabels";

export const userFilters = sortByOrder([
  {
    name: "role",
    label: "Rol",
    type: "checkbox" as const,
    order: 1,
    options: ROLE_OPTIONS,
  },
  {
    name: "isActive",
    label: "Activo",
    type: "checkbox" as const,
    order: 2,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
]);