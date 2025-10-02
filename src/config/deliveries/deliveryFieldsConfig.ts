import { Column } from "../../interfaces/Common";
import { Delivery } from "../../interfaces/Deliveries";
import { sortByOrder } from "../../utils/sortByOrder";
import { renderTypeOrderLabel } from "../../utils/typeOrderLabels";
import { formatDateForView } from "../../utils/formateDateForView";
import { renderStatusOrderLabel } from "../../utils/statusOrderLabels";

export const deliveryColumns: Column<Delivery>[] = sortByOrder([
  { header: "ID", accessor: "id", order: 1 },
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
  { header: "Tipo", accessor: "order_type", order: 5,
    render: (value: string) => renderTypeOrderLabel(value)
  },
  { header: "Estado", accessor: "status", order: 6, 
    render: (value: string) => renderStatusOrderLabel(value)
  },
  { header: "Total", accessor: "total_amount", order: 7 },
]);