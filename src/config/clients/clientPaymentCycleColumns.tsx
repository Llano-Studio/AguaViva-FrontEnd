import { Column } from "../../interfaces/Common";
import { formatDateForView } from "../../utils/formateDateForView";
import { renderStatusPaymentLabel } from "../../utils/statusPaymentLabels";

// helper para tomar valor desde value o desde la fila
const pick = (value: any, row: any, key: string) =>
  value !== undefined ? value : row?.[key];


export const clientPaymentCycleColumns: Column<any>[] = [
  {
    header: "Inicio",
    accessor: "cycle_start",
    order: 1,
    render: (value: any, row?: any) => {
      const v = pick(value, row, "cycle_start");
      return v ? formatDateForView(v) : "-";
    },
  },
  {
    header: "Fin",
    accessor: "cycle_end",
    order: 2,
    render: (value: any, row?: any) => {
      const v = pick(value, row, "cycle_end");
      return v ? formatDateForView(v) : "-";
    },
  },
  {
    header: "Total",
    accessor: "total_amount",
    order: 3,
    render: (value: any, row?: any) => pick(value, row, "total_amount") ?? "-",
  },
  {
    header: "Pagado",
    accessor: "paid_amount",
    order: 4,
    render: (value: any, row?: any) => pick(value, row, "paid_amount") ?? 0,
  },
  {
    header: "Pendiente",
    accessor: "pending_balance",
    order: 5,
    render: (value: any, row?: any) => pick(value, row, "pending_balance") ?? 0,
  },
  {
    header: "Crédito",
    accessor: "credit_balance",
    order: 6,
    render: (value: any, row?: any) => pick(value, row, "credit_balance") ?? 0,
  },
  {
    header: "Estado pago",
    accessor: "payment_status",
    order: 7,
    render: (value: any, row?: any) => {
      const raw = pick(value, row, "payment_status");
      return renderStatusPaymentLabel(raw);
    },
  },
  {
    header: "Vencimiento",
    accessor: "payment_due_date",
    order: 8,
    render: (value: any, row?: any) => {
      const v = pick(value, row, "payment_due_date");
      return v ? formatDateForView(v) : "-";
    },
  },
];