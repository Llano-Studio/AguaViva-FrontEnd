import { sortByOrder } from "../../utils/sortByOrder";

export const subscriptionPlanUpdatePriceConfig = sortByOrder([
  {
    label: "Porcentaje",
    accessor: "percentage",
    type: "number",
    placeholder: "Ingrese el porcentaje",
    min: 0,
    className: "update-percentage-field",
    order: 1,
  },
  {
    label: "Monto fijo",
    accessor: "fixedAmount",
    type: "number",
    placeholder: "Ingrese el monto fijo",
    min: 0,
    className: "update-fixedAmount-field",
    order: 2,
  },
  {
    label: "Motivo",
    accessor: "reason",
    type: "text",
    placeholder: "Ingrese el motivo del cambio",
    required: true,
    className: "update-reason-field",
    order: 3,
  },
]);