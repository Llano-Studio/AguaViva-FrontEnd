import React from "react";
import { sortByOrder } from "../../utils/sortByOrder";

export const vehicleModalConfig = sortByOrder([
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
]);