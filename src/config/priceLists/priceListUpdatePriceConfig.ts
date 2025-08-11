import { sortByOrder } from "../../utils/sortByOrder";

export const priceListUpdatePriceConfig = sortByOrder([
  {
    label: "Porcentaje",
    accessor: "percentage",
    type: "number",
    placeholder: "Ingrese el porcentaje",
    required: true,
    min: 0,
    className: "update-percentage-field",
    order: 1,
  },
  {
    label: "Motivo",
    accessor: "reason",
    type: "text",
    placeholder: "Ingrese el motivo del cambio",
    required: true,
    className: "update-reason-field",
    order: 2,
  },
]);