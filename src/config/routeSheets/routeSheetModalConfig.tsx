import { formatDateForView } from "../../utils/formateDateForView";

export const routeSheetModalConfig = [
  { label: "ID", accessor: "route_sheet_id", order: 0 },
  { label: "Chofer", accessor: "driver.name", order: 1 },
  { label: "Vehículo", accessor: "vehicle.name", order: 2 },
  { label: "Fecha de entrega", accessor: "delivery_date", order: 3, render: formatDateForView },
  { label: "Notas de ruta", accessor: "route_notes", order: 4 },
  { 
    label: "Cantidad de entregas", 
    accessor: "details", 
    order: 5,
    render: (details: any[]) => details?.length ?? 0
  },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));