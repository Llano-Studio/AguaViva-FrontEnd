import { formatDateForView } from "../../utils/formateDateForView";
import { renderPaymentSemaphoreLabel } from "../../utils/paymentSemaphoreLabels";
import { sortByOrder } from "../../utils/sortByOrder";
import { formatDate as formatDateLong } from "../../utils/formatDate";

export const clientModalConfig = [
  { label: "ID cliente", accessor: "person_id", className: "modal-item-1", order: 0 },
  { label: "Nombre", accessor: "name", className: "modal-item-1", order: 0 },
  { label: "Teléfono", accessor: "phone", className: "modal-item-2", order: 1 },
  { label: "Teléfonos adicionales", accessor: "additionalPhones", className: "modal-item-2", order: 2 },
  { label: "Dirección", accessor: "address", className: "modal-item-3", order: 3 },
  { label: "Empresa", accessor: "alias", className: "modal-item-3", order: 4,
    render: (value: string) => value ? value : '-' 
  },
  { label: "CUIT/CUIL", accessor: "taxId", className: "modal-item-4", order: 5 },
  { label: "Localidad", accessor: "locality.name", className: "modal-item-5", order: 6 },
  { label: "Zona", accessor: "zone.name", className: "modal-item-6", order: 7 },
  { 
    label: "Fecha de alta", 
    accessor: "registration_date", 
    className: "modal-item-7", 
    order: 8,
    render: (value: string) => formatDateForView(value)
  },
  { 
    label: "Tipo", 
    accessor: "type", 
    className: "modal-item-8", 
    order: 9,
    render: (value: string) => value === "PLAN" ? "Abono" : "Individual" 
  },
  { label: "Estado de pago", accessor: "payment_semaphore_status", className: "modal-item-9", order: 10,
    render: (value: string) => renderPaymentSemaphoreLabel(value)
  },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));


export const loanedProductsConfig = sortByOrder([
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