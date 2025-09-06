import { sortByOrder } from "../../utils/sortByOrder";
import { formatDate as formatDateLong } from "../../utils/formatDate";
import { formatDateForView } from "../../utils/formateDateForView";

export const clientComodatoListColumns = sortByOrder([
  {
    header: "Producto",
    accessor: "article_description",
    order: 0,
    render: (item: any) => item.article_description || item.product?.name || item.product_id,
  },
  {
    header: "Cantidad",
    accessor: "quantity",
    order: 1,
    render: (item: any) => item.quantity,
  },
  {
    header: "Estado",
    accessor: "status",
    order: 2,
    render: (item: any) => item.status,
  },
  {
    header: "Entrega",
    accessor: "delivery_date",
    order: 3,
    render: (item: any) => renderDate(item.delivery_date),
  },
  {
    header: "Dev. esperada",
    accessor: "expected_return_date",
    order: 4,
    render: (item: any) => renderDate(item.expected_return_date),
  },
]);

function renderDate(v?: string) {
  if (!v) return "";
  const ymd = String(v).slice(0, 10); // "YYYY-MM-DD"
  const _prettyLong = formatDateLong(ymd);
  return formatDateForView(ymd);
}