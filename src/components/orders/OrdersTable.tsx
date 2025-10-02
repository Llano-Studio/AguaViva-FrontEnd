import { useMemo } from "react";
import { OrderTableRow, orderTableColumns } from "../../config/orders/orderFieldsConfig";
import { DataTable } from "../common/DataTable";
import { Column } from "../../interfaces/Common";
import { mapOrdersForTable } from "../../utils/mapOrdersForTable";

interface Props {
  orders: OrderTableRow[];
  onEdit?: (order: OrderTableRow) => void;
  onDelete?: (order: OrderTableRow) => void;
  className?: string;
  columns?: Column<any>[];
  sortBy?: string[];
  sortDirection?: ("asc" | "desc")[];
  onSort?: (column: string) => void;
  onView?: (order: OrderTableRow) => void;
  onPayment?: (order: OrderTableRow) => void;
  paymentVisible?: (order: OrderTableRow) => boolean;
}

// Obtiene un id consistente para ambos tipos de orden
const getRowId = (row: any) => row?.order_id ?? row?.purchase_id ?? row?.id;

const OrdersTable: React.FC<Props> = ({
  orders,
  onEdit,
  onDelete,
  className,
  columns = orderTableColumns as unknown as Column<any>[],
  sortBy,
  sortDirection,
  onSort,
  onView,
  onPayment,
  paymentVisible,
}) => {
  const mappedOrders = mapOrdersForTable(orders as any);

  // Mapa id -> orden original para no romper los tipos al devolver en callbacks
  const idToOriginal = useMemo(() => {
    const map = new Map<any, OrderTableRow>();
    (orders as any[]).forEach((o) => map.set(getRowId(o), o));
    return map;
  }, [orders]);

  // Adaptadores seguros
  const adaptDelete = (id: number) => {
    const original = idToOriginal.get(id);
    if (original && onDelete) onDelete(original);
  };

  const adaptView = (arg: any) => {
    if (!onView) return;
    const id = typeof arg === "number" ? arg : getRowId(arg);
    const original = idToOriginal.get(id);
    onView(original ?? arg);
  };

  const adaptEdit = (arg: any) => {
    if (!onEdit) return;
    const id = typeof arg === "number" ? arg : getRowId(arg);
    const original = idToOriginal.get(id);
    if (original) onEdit(original);
  };

  // Pasar solo props opcionales si existen
  const dataTableProps: any = {
    data: mappedOrders,
    columns: columns as Column<any>[],
    class: className,
    sortBy,
    sortDirection,
    onSort: onSort as any,
  };

  if (onEdit) dataTableProps.onEdit = adaptEdit;
  if (onDelete) dataTableProps.onDelete = adaptDelete;
  if (onView) dataTableProps.onView = adaptView;
  if (onPayment) dataTableProps.onPayment = ((arg: any) => {
    const id = typeof arg === "number" ? arg : getRowId(arg);
    const original = idToOriginal.get(id);
    if (original) (onPayment as any)(original);
  }) as any;
  if (paymentVisible) {
    dataTableProps.paymentVisible = (item: any) =>
      paymentVisible(item as unknown as OrderTableRow);
  }

  return <DataTable<any> {...dataTableProps} />;
};

export default OrdersTable;