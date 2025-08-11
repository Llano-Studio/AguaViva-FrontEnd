type FilterField = {
  name: string;
  label: string;
  type: "select" | "date";
  order: number;
  options?: { label: string; value: string | number }[];
};

export const routeSheetFilters: FilterField[] = [
  {
    name: "driver_id",
    label: "Chofer",
    type: "select" as const,
    order: 1,
    // options: [] // puedes agregar dinámicamente
  },
  {
    name: "vehicle_id",
    label: "Vehículo",
    type: "select" as const,
    order: 2,
    // options: [] // puedes agregar dinámicamente
  },
  {
    name: "delivery_date",
    label: "Fecha de entrega",
    type: "date" as const,
    order: 3,
  },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));