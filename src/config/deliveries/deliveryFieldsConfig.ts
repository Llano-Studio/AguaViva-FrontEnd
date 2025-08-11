import { Column } from "../../interfaces/Common";
import { Delivery } from "../../interfaces/Deliveries";
import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const deliveryColumns: Column<Delivery>[] = sortByOrder([
  { header: "ID", accessor: "order_id", order: 1 },
  { header: "Cliente", accessor: "customer.name", order: 2 },
  { 
    header: "Fecha Pedido", 
    accessor: "order_date", 
    order: 3,
    render: (value: string) => formatDateForView(value)
  },
  { 
    header: "Fecha Entrega", 
    accessor: "scheduled_delivery_date", 
    order: 4,
    render: (value: string) => formatDateForView(value)
  },
  { header: "Estado", accessor: "status", order: 5 },
  { header: "Total", accessor: "total_amount", order: 6 },
]);