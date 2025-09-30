import { OrderTableRow, orderTableColumns } from "../../config/orders/orderFieldsConfig";
import { DataTable } from "../common/DataTable";

interface Props {
  orders: OrderTableRow[];
  onEdit: (order: OrderTableRow) => void;
  onDelete: (order: OrderTableRow) => void;
  className?: string;
  columns?: typeof orderTableColumns;
  sortBy?: string[];
  sortDirection?: ("asc" | "desc")[];
  onSort?: (column: string) => void;
  onView?: (order: OrderTableRow) => void;
  onPayment?: (order: OrderTableRow) => void;
  paymentVisible?: (order: OrderTableRow) => boolean; 
}

// Mapea las filas para agregar la propiedad 'id' y normalizar los campos requeridos por DataTable
const mapRowsWithId = (rows: OrderTableRow[]) =>
  rows.map(row => ({
    ...row,
    id: (row as any).order_id ?? (row as any).purchase_id,
    customer: (row as any).customer ?? { name: (row as any).person?.name ?? "" },
    order_type: (row as any).order_type ?? "ONE_OFF",
    order_date: (row as any).order_date ?? (row as any).purchase_date,
    scheduled_delivery_date: (row as any).scheduled_delivery_date ?? "",
    status: (row as any).status ?? (row as any).delivery_status,
    total_amount: (row as any).total_amount ?? "",
  }));

const OrdersTable: React.FC<Props> = ({
  orders,
  onEdit,
  onDelete,
  className,
  columns = orderTableColumns,
  sortBy,
  sortDirection,
  onSort,
  onView,
  onPayment,         
  paymentVisible,    
}) => {
  const mappedOrders = mapRowsWithId(orders);

  // Adaptador para DataTable: recibe id y busca el pedido original
  const handleDelete = (id: number) => {
    const order = mappedOrders.find(o => o.id === id);
    if (order) onDelete(order);
  };

  return (
    <DataTable
      data={mappedOrders}
      columns={columns}
      onEdit={onEdit}
      onDelete={handleDelete}
      class={className}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort as any}
      onView={onView}
      onPayment={onPayment as any} // propaga el handler
      paymentVisible={
        paymentVisible
          ? ((item) => paymentVisible(item as unknown as OrderTableRow))
          : undefined
      }
    />
  );
};

export default OrdersTable;