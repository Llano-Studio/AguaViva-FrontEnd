import { Field } from "../../interfaces/Common";
import { Column } from "../../interfaces/Common";
import { RouteSheet } from "../../interfaces/RouteSheet";
import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";
import { OrderStatusEnum, OrderStatusValues } from "../../interfaces/Order";


const DeliveryStatusLabels: Record<string, string> = {
  [OrderStatusEnum.PENDING]: "Pendiente",
  [OrderStatusEnum.DELIVERED]: "Entregado",
  [OrderStatusEnum.CANCELLED]: "Cancelado",
};

const allowedDeliveryStatuses = [
  OrderStatusEnum.PENDING,
  OrderStatusEnum.DELIVERED,
  OrderStatusEnum.CANCELLED,
] as const;

export const DeliveryStatusOptions = OrderStatusValues
  .filter((status): status is typeof allowedDeliveryStatuses[number] =>
    allowedDeliveryStatuses.includes(status as typeof allowedDeliveryStatuses[number])
  )
  .map(status => ({
    label: DeliveryStatusLabels[status] || status,
    value: status,
  }));



export const routeSheetFields: Field<any>[] = [
  {
    name: "driver_id",
    label: "Chofer",
    type: "select",
    options: [], // Se debe setear dinámicamente
    validation: { required: true },
    order: 0,
  },
  {
    name: "vehicle_id",
    label: "Vehículo",
    type: "select",
    options: [], // Se debe setear dinámicamente
    validation: { required: true },
    order: 1,
  },
  {
    name: "delivery_date",
    label: "Fecha de entrega",
    type: "date",
    validation: { required: true },
    order: 2,
  },
  {
    name: "route_notes",
    label: "Notas de ruta",
    type: "textarea",
    validation: { required: false },
    order: 3,
  },
  // Los detalles se gestionan en el formulario como un array
];


export const routeSheetDetailFields: Field<any>[] = [
  {
    name: "order_id",
    label: "Pedido",
    type: "select",
    options: [], // Se debe setear dinámicamente
    validation: { required: true },
    order: 0,
  },
  {
    name: "delivery_status",
    label: "Estado de entrega",
    type: "select",
    options: DeliveryStatusOptions,
    validation: { required: true },
    order: 1,
  },
  {
    name: "delivery_time",
    label: "Hora de entrega",
    type: "datetime-local",
    validation: { required: true },
    order: 2,
  },
  {
    name: "comments",
    label: "Comentarios",
    type: "textarea",
    validation: { required: false },
    order: 3,
  },
];

export const routeSheetColumns: Column<RouteSheet>[] = sortByOrder([
  { header: "ID", accessor: "route_sheet_id", order: 0 },
  { header: "Chofer", accessor: "driver.name", order: 1 },
  { header: "Vehículo", accessor: "vehicle.name", order: 2 },
  {
    header: "Zonas",
    accessor: "zones_covered",
    order: 3,
    render: (zones: any[]) =>
      Array.isArray(zones) && zones.length
        ? zones.map(z => z?.name).filter(Boolean).join(", ")
        : "-"
  },
  { header: "Fecha de entrega", accessor: "delivery_date", order: 4, render: formatDateForView },
  { header: "Notas", accessor: "route_notes", order: 5 },
  {
    header: "Cantidad de entregas",
    accessor: "details",
    order: 6,
    render: (details: any[]) => details?.length ?? 0
  },
]);


