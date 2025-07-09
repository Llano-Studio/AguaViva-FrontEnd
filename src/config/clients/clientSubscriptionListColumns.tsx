import { sortByOrder } from "../../utils/sortByOrder";

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
    render: (item: any) => item.start_date,
  },
  {
    header: "Fecha fin",
    accessor: "end_date",
    order: 4,
    render: (item: any) => item.end_date,
  },
  {
    header: "Estado",
    accessor: "status",
    order: 5,
    render: (item: any) => item.status,
  },
]);