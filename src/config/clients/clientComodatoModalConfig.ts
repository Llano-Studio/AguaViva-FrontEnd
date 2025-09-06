import { sortByOrder } from "../../utils/sortByOrder";
import { formatDate as formatDateLong } from "../../utils/formatDate";
import { formatDateForView } from "../../utils/formateDateForView";

export const clientComodatoModalConfig = sortByOrder([
  { label: "ID", accessor: "comodato_id", order: 0 },
  { label: "Producto ID", accessor: "product_id", order: 1 },
  { label: "Descripción", accessor: "article_description", order: 2 },
  { label: "Cantidad", accessor: "quantity", order: 3 },
  { label: "Estado", accessor: "status", order: 4, render: (v: string) => statusMap[v] || v },
  { label: "Entrega", accessor: "delivery_date", order: 5, render: renderDate },
  { label: "Devolución esperada", accessor: "expected_return_date", order: 6, render: renderDate },
  { label: "Devolución real", accessor: "actual_return_date", order: 7, render: renderDate },
  { label: "Depósito", accessor: "deposit_amount", order: 8,},
  { label: "Cuota mensual", accessor: "monthly_fee", order: 9,},
  { label: "Marca", accessor: "brand", order: 10 },
  { label: "Modelo", accessor: "model", order: 11 },
  { label: "Contrato", accessor: "contract_image_path", order: 12 },
  { label: "Notas", accessor: "notes", order: 13 },
]);


function renderDate(v?: string) {
  if (!v) return "";
  const ymd = String(v).slice(0, 10); // "YYYY-MM-DD" desde ISO
  // Aplicamos primero el formateo largo (se mantiene como paso explícito)
  const _prettyLong = formatDateLong(ymd);
  // Y retornamos el formateo para vista estándar
  return formatDateForView(ymd);
}

const statusMap: Record<string, string> = {
  ACTIVE: "Activo",
  RETURNED: "Devuelto",
  INACTIVE: "Inactivo",
};