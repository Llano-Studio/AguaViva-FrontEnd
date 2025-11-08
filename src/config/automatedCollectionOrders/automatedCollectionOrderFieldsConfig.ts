import { Column } from "../../interfaces/Common";
import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

// Columnas para la tabla
export const automatedCollectionOrderColumns: Column<any>[] = sortByOrder([
  { header: "Archivo", accessor: "filename", order: 0 },
  { header: "Fecha de entrega", accessor: "date", order: 1, render: (v: string) => (v ? formatDateForView(v) : "-") },
  { header: "Vehículo", accessor: "vehicleName", order: 2, render: (v: any) => v ?? "-" },
  { header: "Chofer", accessor: "driverName", order: 3, render: (v: any) => v ?? "-" },
  {
    header: "Zonas",
    accessor: "zoneNames",
    order: 4,
    render: (val: any) => {
      if (typeof val === "string") return val || "-";         // <- aceptar string enriquecido
      if (Array.isArray(val) && val.length) return val.join(", ");
      return "-";
    },
  },
  { header: "Creado", accessor: "createdAt", order: 6, render: (v: string) => (v ? formatDateForView(v) : "-") },
]);

// Config para el Modal de detalle (simple)
export const automatedCollectionOrderModalConfig = [
  { label: "Archivo", accessor: "filename", type: "text" },
  { label: "Fecha de entrega", accessor: "date", type: "text", render: (v: string) => (v ? formatDateForView(v) : "-") },
  { label: "Vehículo", accessor: "vehicleName", type: "text" },
  { label: "Chofer", accessor: "driverName", type: "text" },
  {
    label: "Zonas",
    accessor: "zoneNames",
    type: "text",
    render: (val: any) => {
      if (typeof val === "string") return val || "-";
      if (Array.isArray(val)) return val.join(", ");
      return "-";
    },
  },
  { label: "Tamaño (bytes)", accessor: "sizeBytes", type: "text" },
  { label: "Creado", accessor: "createdAt", type: "text", render: (v: string) => (v ? formatDateForView(v) : "-") },
  { label: "URL descarga", accessor: "downloadUrl", type: "text" },
];