import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const deliveryModalConfig = sortByOrder([
  { label: "ID", accessor: "order_id", order: 1 },
  { label: "Cliente", accessor: "customer.name", order: 2 },
  { 
    label: "Fecha Pedido", 
    accessor: "order_date", 
    order: 3,
    render: (value: string) => formatDateForView(value)
  },
  { 
    label: "Fecha Entrega", 
    accessor: "scheduled_delivery_date", 
    order: 4,
    render: (value: string) => formatDateForView(value)
  },
  { label: "Estado", accessor: "status", order: 5 },
  { label: "Total", accessor: "total_amount", order: 6 },
  { label: "Notas", accessor: "notes", order: 7 },
]);