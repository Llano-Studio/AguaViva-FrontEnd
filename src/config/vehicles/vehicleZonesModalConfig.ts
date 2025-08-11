import { sortByOrder } from "../../utils/sortByOrder";

export const vehicleZonesModalConfig = sortByOrder([
  { label: "Zona", accessor: "zone.name", order: 0 },
  { label: "Localidad", accessor: "zone.locality.name", order: 1 },
  { label: "Provincia", accessor: "zone.locality.province.name", order: 2 },
  { label: "País", accessor: "zone.locality.province.country.name", order: 3 },
  { label: "Fecha asignación", accessor: "assigned_at", order: 4, render: (v: string) => v ? new Date(v).toLocaleDateString() : "" },
  { label: "Estado", accessor: "is_active", order: 5, render: (v: boolean) => v ? "Activo" : "Inactivo" },
  { label: "Notas", accessor: "notes", order: 6 },
]);