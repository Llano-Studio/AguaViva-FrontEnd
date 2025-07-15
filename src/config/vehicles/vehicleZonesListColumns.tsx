import { sortByOrder } from "../../utils/sortByOrder";

export const vehicleZonesListColumns = sortByOrder([
  {
    header: "Zona",
    accessor: "zone.name",
    order: 0,
    render: (item: any) => item.zone?.name || "",
  },
  {
    header: "Localidad",
    accessor: "zone.locality.name",
    order: 1,
    render: (item: any) => item.zone?.locality?.name || "",
  },
  {
    header: "Provincia",
    accessor: "zone.locality.province.name",
    order: 2,
    render: (item: any) => item.zone?.locality?.province?.name || "",
  },
  {
    header: "País",
    accessor: "zone.locality.province.country.name",
    order: 3,
    render: (item: any) => item.zone?.locality?.province?.country?.name || "",
  },
  {
    header: "Fecha asignación",
    accessor: "assigned_at",
    order: 4,
    render: (item: any) => item.assigned_at ? new Date(item.assigned_at).toLocaleDateString() : "",
  },
  {
    header: "Estado",
    accessor: "is_active",
    order: 5,
    render: (item: any) => item.is_active ? "Activo" : "Inactivo",
  },
  {
    header: "Notas",
    accessor: "notes",
    order: 6,
    render: (item: any) => item.notes || "",
  },

]);