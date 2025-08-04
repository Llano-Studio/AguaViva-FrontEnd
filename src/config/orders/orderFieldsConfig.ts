import { Column, Field } from "../../interfaces/Common";
import { Order, CreateOrderFormDTO } from "../../interfaces/Order";
import { OrderOneOff, CreateOrderOneOffFormDTO } from "../../interfaces/OrderOneOff";
import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView"; // <-- Agrega este import


// Campos para formulario de artículos de la orden
export const orderArticleFields: Field<any>[] = [
  { name: "abono", label: "Abono", type: "search", validation: { required: false }, order: 0 },
  { name: "product_id", label: "Artículo", type: "search", validation: { required: true }, order: 1 },
  { name: "quantity", label: "Cantidad", type: "number", validation: { required: true }, order: 2 },
  { name: "price_list_id", label: "Lista de precios", type: "search", validation: { required: false }, order: 3 },
];

export const orderOneOffArticleFields: Field<any>[] = [
  { name: "product_id", label: "Artículo", type: "search", validation: { required: true }, order: 1 },
  { name: "quantity", label: "Cantidad", type: "number", validation: { required: true }, order: 2 },
  { name: "price_list_id", label: "Lista de precios", type: "search", validation: { required: false }, order: 3 },
];


export const orderClientFields: Field<CreateOrderFormDTO>[] = [
  {
    name: "customer_id",
    label: "ID Cliente",
    type: "search",
    validation: { required: false },
    order: 0,
  },
  {
    name: "customer_name",
    label: "Nombre y apellido",
    type: "search",
    validation: { required: false },
    order: 1,
  },
  {
    name: "customer_address",
    label: "Dirección",
    type: "search",
    validation: { required: false },
    order: 2,
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "search",
    validation: { required: false },
    order: 3,
  },
];

export const orderPedidoFields: Field<CreateOrderFormDTO>[] = [
  { name: "order_date", label: "Fecha del pedido", type: "date", validation: { required: true }, order: 0 },
  { name: "scheduled_delivery_date", label: "Fecha de entrega", type: "date", validation: { required: true }, order: 1 },
  { name: "zone_name", label: "Zona", type: "text", validation: { required: false }, order: 2, disabled: true },
  { name: "mobile", label: "Movil", type: "select", validation: { required: false }, order: 3 },
  { name: "delivery_time_start", label: "Horario inicial", type: "time", validation: { required: true }, order: 4 },
  { name: "delivery_time_end", label: "final", type: "time", validation: { required: true }, order: 5 },
];

export const orderOneOffPedidoFields: Field<CreateOrderFormDTO>[] = [
  { name: "order_date", label: "Fecha del pedido", type: "date", validation: { required: true }, order: 0 },
  { name: "scheduled_delivery_date", label: "Fecha de entrega", type: "date", validation: { required: true }, order: 1 },
  { name: "zone_name", label: "Zona", type: "text", validation: { required: false }, order: 2, disabled: true },
  { name: "mobile", label: "Movil", type: "select", validation: { required: false }, order: 3 },
  { name: "delivery_time_start", label: "Horario inicial", type: "time", validation: { required: true }, order: 4 },
  { name: "delivery_time_end", label: "final", type: "time", validation: { required: true }, order: 5 },
];

export const orderNotesFields: Field<CreateOrderFormDTO>[] = [
  { name: "notes", label: "Observaciones", type: "textarea", validation: { required: false }, order: 1 },
];

export const orderOneOffNotesFields: Field<CreateOrderOneOffFormDTO>[] = [
  { name: "notes", label: "Observaciones", type: "textarea", validation: { required: false }, order: 1 },
];

// Campos para formulario de órdenes One-Off (multi-one-off-purchases)
export const orderOneOffClientFields = (): Field<CreateOrderOneOffFormDTO>[] => sortByOrder([
  {
    name: "person_id",
    label: "ID Cliente",
    type: "search",
    validation: { required: false },
    order: 0,
  },
  {
    name: "customer_name",
    label: "Nombre y apellido",
    type: "search",
    validation: { required: false },
    order: 1,
  },
  {
    name: "delivery_address",
    label: "Dirección",
    type: "search",
    validation: { required: false },
    order: 2,
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "search",
    validation: { required: false },
    order: 3,
  },
]);

// Columnas para la tabla unificada de órdenes y One-Off
export const orderTableColumns: Column<{ [key: string]: any }>[] = sortByOrder([
  { header: "ID", accessor: "id", order: 0 },
  { header: "Cliente", accessor: "customer.name", order: 1 },
  { header: "Tipo", accessor: "order_type", order: 2 },
  { 
    header: "Fecha", 
    accessor: "order_date", 
    order: 3,
    render: (value: string) => formatDateForView(value)
  },
  { 
    header: "Entrega", 
    accessor: "scheduled_delivery_date", 
    order: 4,
    render: (value: string) => formatDateForView(value)
  },
  { header: "Estado", accessor: "status", order: 5 },
  { header: "Total", accessor: "total_amount", order: 6 },
]);

export type OrderTableRow = Order | OrderOneOff;