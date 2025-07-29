import { sortByOrder } from "../../utils/sortByOrder";
import { renderRoleLabel } from "../../utils/roleLabels";

export const vehicleUsersListColumns = sortByOrder([
  {
    header: "Nombre",
    accessor: "name",
    order: 0,
    render: (item: any) => item.name || "",
  },
  {
    header: "Email",
    accessor: "email",
    order: 1,
    render: (item: any) => item.email || "",
  },
  {
    header: "Rol",
    accessor: "role",
    order: 2,
    render: (item: any) => renderRoleLabel(item.role) || "",
  },
  {
    header: "Estado",
    accessor: "isActive",
    order: 3,
    render: (item: any) => item.isActive ? "Activo" : "Inactivo",
  },
]);