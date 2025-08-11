import React from "react";
import { sortByOrder } from "../../utils/sortByOrder";

const vehicleModalConfigRaw = [
  {
    label: "Código",
    accessor: "code",
    className: "modal-item-1",
    order: 1,
  },
  {
    label: "Nombre",
    accessor: "name",
    className: "modal-item-2",
    order: 2,
  },
  {
    label: "Descripción",
    accessor: "description",
    className: "modal-item-3",
    order: 3,
  },
  {
    label: "Zonas asignadas",
    accessor: "assignedZones",
    render: (assignedZones: any[]) =>
      Array.isArray(assignedZones) && assignedZones.length > 0 ? (
        <ul>
          {assignedZones.map((z: any) => (
            <li key={z.zone_id}>{z.zone?.name || `Zona #${z.zone_id}`}</li>
          ))}
        </ul>
      ) : (
        <span>No hay zonas asignadas</span>
      ),
    order: 4,
  },
  {
    label: "Usuarios asignados",
    accessor: "assignedUsers",
    render: (assignedUsers: any[]) =>
      Array.isArray(assignedUsers) && assignedUsers.length > 0 ? (
        <ul>
          {assignedUsers.map((u: any) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      ) : (
        <span>No hay usuarios asignados</span>
      ),
    order: 5,
  },
];

export const vehicleModalConfig = sortByOrder(vehicleModalConfigRaw);