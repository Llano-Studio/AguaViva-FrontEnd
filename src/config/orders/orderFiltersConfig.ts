import { FilterField } from "../../components/common/FilterDrawer";

export const orderFiltersConfig: FilterField[] = [
  {
    label: "Tipo de Pedido",
    name: "type",
    type: "select", // <-- debe ser "select", no string
    options: [
      { label: "Todos", value: "ALL" },
      { label: "Regulares", value: "ORDER" },
      { label: "One-Off", value: "ONE_OFF" },
    ],
  },
  // Agrega más filtros aquí, asegurándote de usar los tipos correctos
  // { label: "Estado", name: "status", type: "select", options: [...] },
  // { label: "Fecha", name: "order_date", type: "date" },
];