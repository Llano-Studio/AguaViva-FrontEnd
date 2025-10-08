import { sortByOrder } from "../../utils/sortByOrder";
import { formatDate as formatDateLong } from "../../utils/formatDate";
import { formatDateForView } from "../../utils/formateDateForView";
import PreviewImg from "../../components/common/PreviewImg";
import PreviewPDF from "../../components/common/PreviewPDF";

const isPdfUrl = (url?: string) => !!url && /\.pdf(?:$|\?)/i.test(url);
const isImageUrl = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp|bmp|svg)(?:$|\?)/i.test(url);

export const clientComodatoModalConfig = sortByOrder([
  { label: "ID", accessor: "comodato_id", order: 0 },
  { label: "Producto ID", accessor: "product_id", order: 1 },
  { label: "Descripción", accessor: "article_description", order: 2 },
  { label: "Cantidad", accessor: "quantity", order: 3 },
  { label: "Estado", accessor: "status", order: 4, render: (v: string) => statusMap[v] || v },
  { label: "Entrega", accessor: "delivery_date", order: 5, render: renderDate },
  { label: "Devolución esperada", accessor: "expected_return_date", order: 6, render: renderDate },
  { label: "Devolución real", accessor: "actual_return_date", order: 7, render: renderDate },
  { label: "Depósito", accessor: "deposit_amount", order: 8 },
  { label: "Cuota mensual", accessor: "monthly_fee", order: 9 },
  { label: "Marca", accessor: "brand", order: 10 },
  { label: "Modelo", accessor: "model", order: 11 },
  {
    label: "Contrato",
    accessor: "contract_image_path",
    className: "modal-item-image",
    order: 12,
    render: (value: string) => {
      if (!value) return "Sin archivo";
      if (isPdfUrl(value)) {
        return <PreviewPDF href={value} width={120} height={120} />;
      }
      if (isImageUrl(value)) {
        return <PreviewImg src={value} alt="Contrato" width={120} height={120} />;
      }
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir archivo en nueva pestaña"
          style={{ display: "inline-block" }}
        >
          Abrir archivo
        </a>
      );
    },
  },
  { label: "Notas", accessor: "notes", order: 13 },
]);

function renderDate(v?: string) {
  if (!v) return "";
  const ymd = String(v).slice(0, 10);
  const _prettyLong = formatDateLong(ymd);
  return formatDateForView(ymd);
}

const statusMap: Record<string, string> = {
  ACTIVE: "Activo",
  RETURNED: "Devuelto",
  INACTIVE: "Inactivo",
};