import { sortByOrder } from "../../utils/sortByOrder";

export const userFilters = sortByOrder([
  {
    name: "role",
    label: "Rol",
    type: "checkbox" as const,
    order: 1,
    options: [
      { label: "Usuario", value: "USER" },
      { label: "Administrador", value: "ADMIN" },
    ],
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