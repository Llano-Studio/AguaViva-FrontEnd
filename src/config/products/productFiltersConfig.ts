import { sortByOrder } from "../../utils/sortByOrder";

export const productFilters = sortByOrder([
  {
    name: "categoryIds",
    label: "Categoría",
    type: "select" as const,
    order: 1,
    // options: [...] // Puedes cargar dinámicamente las categorías
  },
  {
    name: "isReturnable",
    label: "Retornable",
    type: "checkbox" as const,
    order: 3,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
]);