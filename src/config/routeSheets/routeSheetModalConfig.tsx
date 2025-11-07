import { formatDateForView } from "../../utils/formateDateForView";

export const routeSheetModalConfig = [
  { label: "ID", accessor: "route_sheet_id", order: 0 },
  { label: "Chofer", accessor: "driver.name", order: 1 },
  { label: "Vehículo", accessor: "vehicle.name", order: 2 },
  {
    label: "Zonas",
    accessor: "zones_covered",
    order: 3,
    render: (zones: any[]) =>
      Array.isArray(zones) && zones.length
        ? zones.map(z => z?.name).filter(Boolean).join(", ")
        : "-"
  },
  { label: "Fecha de entrega", accessor: "delivery_date", order: 4, render: formatDateForView },
  { label: "Notas de ruta", accessor: "route_notes", order: 5 },
  {
    label: "Cantidad de entregas",
    accessor: "details",
    order: 6,
    render: (details: any[]) => details?.length ?? 0
  },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));