import React from "react";
import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

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
    accessor: "default_cycle_days",
    className: "modal-item-4",
    order: 4,
  },
  {
    label: "Entregas por ciclo",
    accessor: "default_deliveries_per_cycle",
    className: "modal-item-5",
    order: 5,
  },
  {
    label: "Estado",
    accessor: "is_active",
    className: "modal-item-6",
    order: 6,
    render: (value: boolean) => value ? "Activo" : "Inactivo",
  },
  {
    label: "Fecha de creación",
    accessor: "created_at",
    className: "modal-item-7",
    order: 7,
    render: (value: string) => formatDateForView(value)
  },
  {
    label: "Fecha de modificación",
    accessor: "updated_at",
    className: "modal-item-8",
    order: 8,
    render: (value: string) => formatDateForView(value)
  },
  {
    label: "Productos",
    accessor: "products",
    className: "modal-item-9",
    order: 9,
    render: (products: any[]) => (
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