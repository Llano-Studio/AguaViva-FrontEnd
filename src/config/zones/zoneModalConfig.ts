import React from "react";
import { sortByOrder } from "../../utils/sortByOrder";

export const zoneModalConfig = sortByOrder([
  {
    label: "Nombre",
    accessor: "name",
    className: "modal-item-1",
    order: 1,
  },
  {
    label: "Código",
    accessor: "code",
    className: "modal-item-2",
    order: 2,
  },
  {
    label: "País",
    accessor: "locality.province.country.name",
    className: "modal-item-3",
    order: 3,
  },
  {
    label: "Provincia",
    accessor: "locality.province.name",
    className: "modal-item-4",
    order: 4,
  },
  {
    label: "Localidad",
    accessor: "locality.name",
    className: "modal-item-5",
    order: 5,
  },
]);