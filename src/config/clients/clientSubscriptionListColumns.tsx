import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const clientSubscriptionListColumns = sortByOrder([
  { header: "Abono", accessor: "subscription_plan_name", order: 0, render: (item: any) => item.subscription_plan?.name },
  { header: "Descripción", accessor: "subscription_plan_description", order: 1, render: (item: any) => item.subscription_plan?.description },
  { header: "Precio", accessor: "subscription_plan_price", order: 2, render: (item: any) => item.subscription_plan?.price },
  { header: "Fecha inicio", accessor: "start_date", order: 3, render: (item: any) => formatDateForView(item.start_date) },
  { header: "Día de recolección", accessor: "collection_day", order: 4, render: (item: any) => item.collection_day },
  { header: "Modo de pago", accessor: "payment_mode", order: 5, render: (item: any) => item.payment_mode === "ADVANCE" ? "Adelantado" : "Vencido" },
  { header: "Día de vencimiento", accessor: "payment_due_day", order: 6, render: (item: any) => item.payment_due_day ?? "" },
  { header: "Estado", accessor: "status", order: 7, render: (item: any) => item.status },
]);