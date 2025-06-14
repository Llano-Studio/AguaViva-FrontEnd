import { sortByOrder } from "../../utils/sortByOrder";

export const productFilters = sortByOrder([
  {
    name: "categoryId",
    label: "Categoría",
    type: "select" as const,
    order: 1,
    // options: [...] // Puedes cargar dinámicamente las categorías
  },
  {
    name: "description",
    label: "Descripción",
    type: "text" as const,
    order: 2,
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
  {
    name: "serialNumber",
    label: "N° de serie",
    type: "text" as const,
    order: 4,
  },
]);