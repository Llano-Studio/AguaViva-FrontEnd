import React from "react";
import { sortByOrder } from "../../utils/sortByOrder";

export const subscriptionPlanModalConfig = sortByOrder([
  {
    label: "Nombre",
    accessor: "name",
    className: "modal-item-1",
    order: 1,
  },
  {
    label: "Descripción",
    accessor: "description",
    className: "modal-item-2",
    order: 2,
  },
  {
    label: "Precio",
    accessor: "price",
    className: "modal-item-3",
    order: 3,
  },
  {
    label: "Días por ciclo",
    accessor: "cycle_days",
    className: "modal-item-4",
    order: 4,
  },
  {
    label: "Entregas por ciclo",
    accessor: "deliveries_per_cycle",
    className: "modal-item-5",
    order: 5,
  },
  {
    label: "Estado",
    accessor: "active",
    className: "modal-item-6",
    order: 6,
    render: (value: boolean) => value ? "Activo" : "Inactivo",
  },
  {
    label: "Productos",
    accessor: "products",
    className: "modal-item-7",
    order: 7,
    render: (products) => (
      <ul>
        {Array.isArray(products) && products.map((p: any) => (
          <li key={p.product_id}>
            {p.product_description} (x{p.quantity})
          </li>
        ))}
      </ul>
    ),
  },
]);