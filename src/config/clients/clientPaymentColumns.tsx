import { Column } from "../../interfaces/Common";
import { formatDateTimeForView } from "../../utils/formatDateTimeForView";

// toma el valor desde value o, si no viene, desde la fila
const pick = (value: any, row: any, key: string) =>
  value !== undefined ? value : row?.[key];

export const clientPaymentColumns: Column<any>[] = [
  {
    header: "Fecha y hora de pago",
    accessor: "payment_date",
    order: 0,
    render: (value: any, row?: any) => {
      const v = pick(value, row, "payment_date");
      if (!v) return "-";
      return formatDateTimeForView(v);
    },
  },
  {
    header: "Método",
    accessor: "payment_method",
    order: 1,
    render: (value: any, row?: any) => pick(value, row, "payment_method") ?? "-",
  },
  {
    header: "Monto",
    accessor: "amount",
    order: 2,
    render: (value: any, row?: any) => pick(value, row, "amount") ?? 0,
  },
  {
    header: "Referencia",
    accessor: "reference",
    order: 3,
    render: (value: any, row?: any) => pick(value, row, "reference") ?? "-",
  },
  {
    header: "Notas",
    accessor: "notes",
    order: 4,
    render: (value: any, row?: any) => pick(value, row, "notes") ?? "",
  },
];  