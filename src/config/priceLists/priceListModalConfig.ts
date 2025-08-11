import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const priceListModalConfig = sortByOrder([
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
    label: "Fecha de vigencia",
    accessor: "effective_date",
    className: "modal-item-3",
    order: 3,
    render: (value: string) => formatDateForView(value)
  },
  {
    label: "Por defecto",
    accessor: "is_default",
    className: "modal-item-4",
    order: 4,
    render: (value: boolean) => value ? "Si" : "No",
  },
  {
    label: "Activa",
    accessor: "active",
    className: "modal-item-5",
    order: 5,
    render: (value: boolean) => value ? "Si" : "No",
  },
  {
    label: "Fecha de creación",
    accessor: "created_at",
    className: "modal-item-6",
    order: 6,
    render: (value: string) => formatDateForView(value)
  },
  {
    label: "Fecha de modificación",
    accessor: "updated_at",
    className: "modal-item-7",
    order: 7,
    render: (value: string) => formatDateForView(value)
  },
]);