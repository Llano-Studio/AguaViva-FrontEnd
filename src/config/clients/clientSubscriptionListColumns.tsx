import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const clientSubscriptionListColumns = sortByOrder([
  {
    header: "Abono",
    accessor: "subscription_plan_name",
    order: 0,
    render: (item: any) => item.subscription_plan?.name,
  },
  {
    header: "Descripción",
    accessor: "subscription_plan_description",
    order: 1,
    render: (item: any) => item.subscription_plan?.description,
  },
  {
    header: "Precio",
    accessor: "subscription_plan_price",
    order: 2,
    render: (item: any) => item.subscription_plan?.price,
  },
  {
    header: "Fecha inicio",
    accessor: "start_date",
    order: 3,
    render: (item: any) => formatDateForView(item.start_date),
  },
  {
    header: "Estado",
    accessor: "status",
    order: 4,
    render: (item: any) => item.status,
  },
]);