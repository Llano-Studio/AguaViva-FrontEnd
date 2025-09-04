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
    type: "checkbox" as const,
    order: 1,
    options: [
      { label: "Individual", value: "INDIVIDUAL" },
      { label: "Abono", value: "PLAN" }
    ],
  },
  {
    name: "zoneIds",
    label: "Zona",
    type: "checkbox" as const,
    order: 2,
    // Puedes agregar options dinámicamente si lo necesitas
  },
  {
    name: "localityIds",
    label: "Localidad",
    type: "select" as const,
    order: 3,
    // Puedes agregar options dinámicamente si lo necesitas
  },
  {
    name: "is_active",
    label: "Estado",
    type: "checkbox" as const,
    order: 4,
    options: [
      { label: "Activo", value: "true" },
      { label: "Inactivo", value: "false" }
    ],
  },
  

].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));