import { sortByOrder } from "../../utils/sortByOrder";
import { SubscriptionPlanProduct } from "../../interfaces/SubscriptionPlan";

export const subscriptionPlanProductListColumns = sortByOrder([
  {
    header: "Artículo",
    accessor: "product_with_image",
    order: 0,
    render: (item: any) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt="foto producto"
            style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: "#aaa", width: 48, height: 48, display: "inline-block" }}>Sin imagen</span>
        )}
        <span>{item.product_description}</span>
      </div>
    ),
  },
  {
    header: "ID Artículo",
    accessor: "product_id",
    order: 2,
    render: (item: SubscriptionPlanProduct) => item.product_id,
  },
  {
    header: "Cantidad",
    accessor: "quantity",
    order: 3,
    render: (item: SubscriptionPlanProduct) => item.quantity,
  },
]);