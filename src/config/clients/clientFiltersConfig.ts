type FilterField = {
  name: string;
  label: string;
  type: "select" | "checkbox";
  order: number;
  options?: { label: string; value: string }[];
};

export const clientFilters: FilterField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "select" as const,
    order: 1,
    options: [
      { label: "Individual", value: "INDIVIDUAL" },
      { label: "Abono", value: "PLAN" }
    ],
  },
  {
    name: "zoneId",
    label: "Zona",
    type: "select" as const,
    order: 2,
    // Puedes agregar options dinámicamente si lo necesitas
  },
  {
    name: "localityId",
    label: "Localidad",
    type: "select" as const,
    order: 3,
    // Puedes agregar options dinámicamente si lo necesitas
  },
  {
    name: "isActive",
    label: "Activo",
    type: "checkbox" as const,
    order: 4,
    options: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
  },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));