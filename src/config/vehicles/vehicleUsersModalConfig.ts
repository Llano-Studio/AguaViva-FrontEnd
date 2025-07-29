import { sortByOrder } from "../../utils/sortByOrder";
import { renderRoleLabel } from "../../utils/roleLabels";

export const vehicleUsersModalConfig = sortByOrder([
  { label: "Nombre", accessor: "user.name", order: 0 },
  { label: "Email", accessor: "user.email", order: 1 },
  { label: "Rol", accessor: "user.role", order: 2,
    render: (value: string) => renderRoleLabel(value)
   },
  { label: "Activo", accessor: "is_active", order: 3, render: (v: boolean) => v ? "Sí" : "No" },
  { label: "Notas", accessor: "notes", order: 4 },
  { label: "Asignado el", accessor: "assigned_at", order: 5, render: (v: string) => v ? new Date(v).toLocaleString() : "" },
  { label: "Vehículo", accessor: "vehicle.name", order: 6 },
  { label: "Código vehículo", accessor: "vehicle.code", order: 7 },
  { label: "Descripción vehículo", accessor: "vehicle.description", order: 8 },
]);