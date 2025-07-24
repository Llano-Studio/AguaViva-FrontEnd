import { Column, Field } from "../../interfaces/Common";
import { Order, CreateOrderFormDTO } from "../../interfaces/Order";
import { OrderOneOff, CreateOrderOneOffDTO } from "../../interfaces/OrderOneOff";
import { sortByOrder } from "../../utils/sortByOrder";


// Campos para formulario de órdenes regulares (Order)
export const orderFormFields = (): Field<CreateOrderFormDTO>[] => sortByOrder([
  { name: "customer_id", label: "Cliente", type: "search", validation: { required: true }, order: 0 },
  { name: "order_type", label: "Tipo de Orden", type: "select", validation: { required: true }, order: 1, options: [
    { label: "Suscripción", value: "SUBSCRIPTION" },
    { label: "Híbrida", value: "HYBRID" },
    { label: "Por Contrato", value: "CONTRACT_DELIVERY" },
  ]},
  { name: "subscription_id", label: "Suscripción", type: "select", validation: { required: false }, order: 2 },
  { name: "contract_id", label: "Contrato", type: "select", validation: { required: false }, order: 3 },
  { name: "sale_channel_id", label: "Canal de Venta", type: "select", validation: { required: true }, order: 4 },
  { name: "order_date", label: "Fecha de Orden", type: "date", validation: { required: true }, order: 5 },
  { name: "scheduled_delivery_date", label: "Fecha de Entrega", type: "date", validation: { required: true }, order: 6 },
  { name: "delivery_time", label: "Horario de Entrega", type: "text", validation: { required: false }, order: 7 },
  { name: "total_amount", label: "Total", type: "number", validation: { required: true }, order: 8 },
  { name: "paid_amount", label: "Pagado", type: "number", validation: { required: true }, order: 9 },
  { name: "status", label: "Estado", type: "select", validation: { required: true }, order: 10, options: [
    { label: "Pendiente", value: "PENDING" },
    { label: "Confirmada", value: "CONFIRMED" },
    { label: "En preparación", value: "IN_PREPARATION" },
    { label: "Lista para entregar", value: "READY_FOR_DELIVERY" },
    { label: "En entrega", value: "IN_DELIVERY" },
    { label: "Entregada", value: "DELIVERED" },
    { label: "Cancelada", value: "CANCELLED" },
    { label: "Reembolsada", value: "REFUNDED" },
  ]},
  { name: "notes", label: "Notas", type: "text", validation: { required: false }, order: 11 },
]);

// Campos para formulario de artículos de la orden
export const orderArticleFields: Field<any>[] = [
  { name: "abono", label: "Abono", type: "search", validation: { required: false }, order: 0 },
  { name: "product_id", label: "Artículo", type: "search", validation: { required: true }, order: 1 },
  { name: "quantity", label: "Cantidad", type: "number", validation: { required: true }, order: 2 },
  { name: "price_list_id", label: "Lista de precios", type: "search", validation: { required: false }, order: 3 },
];

export const orderClientFields: Field<CreateOrderFormDTO>[] = [
  { name: "customer_id", label: "Nombre y apellido", type: "search", validation: { required: true }, order: 0 },
  { name: "customer_address", label: "Dirección", type: "text", validation: { required: false }, order: 1, disabled: true },
  { name: "customer_id_display", label: "Cliente ID", type: "number", validation: { required: false }, order: 2, disabled: true },
];

export const orderPedidoFields: Field<CreateOrderFormDTO>[] = [
  { name: "order_date", label: "Fecha del pedido", type: "date", validation: { required: true }, order: 0 },
  { name: "scheduled_delivery_date", label: "Fecha de entrega", type: "date", validation: { required: true }, order: 1 },
  { name: "zone", label: "Zona", type: "text", validation: { required: false }, order: 2, disabled: true },
  { name: "mobile", label: "Movil", type: "select", validation: { required: false }, order: 3 },
  { name: "delivery_time", label: "Horario", type: "text", validation: { required: false }, order: 4 },
];

export const orderNotesFields: Field<CreateOrderFormDTO>[] = [
  { name: "notes", label: "Observaciones", type: "textarea", validation: { required: false }, order: 1 },
];

// Campos para formulario de órdenes One-Off (multi-one-off-purchases)
export const orderOneOffFormFields = (): Field<CreateOrderOneOffDTO>[] => sortByOrder([
  { name: "person_id", label: "Cliente", type: "search", validation: { required: true }, order: 0 },
  { name: "sale_channel_id", label: "Canal de Venta", type: "select", validation: { required: true }, order: 1 },
  { name: "delivery_address", label: "Dirección de Entrega", type: "text", validation: { required: true }, order: 2 },
  { name: "notes", label: "Notas", type: "text", validation: { required: false }, order: 3 },
  { name: "paid_amount", label: "Monto Pagado", type: "number", validation: { required: true }, order: 4 },
  // Los items/productos se gestionan aparte en el formulario dinámicamente
]);

// Columnas para la tabla unificada de órdenes y One-Off
export const orderTableColumns: Column<{ [key: string]: any }>[] = sortByOrder([
  { header: "ID", accessor: "id", order: 0 },
  { header: "Cliente", accessor: "customer.name", order: 1 },
  { header: "Tipo", accessor: "order_type", order: 2 },
  { header: "Fecha", accessor: "order_date", order: 3 },
  { header: "Entrega", accessor: "scheduled_delivery_date", order: 4 },
  { header: "Estado", accessor: "status", order: 5 },
  { header: "Total", accessor: "total_amount", order: 6 },
]);

export type OrderTableRow = Order | OrderOneOff;