import { PriceListItem } from "../../interfaces/PriceListItem";
import { sortByOrder } from "../../utils/sortByOrder";


export const priceListItemListColumns = sortByOrder([
  {
    header: "Producto",
    accessor: "product_with_image",
    order: 1,
    render: (item: PriceListItem) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {item.product?.image_url ? (
          <img
            src={item.product.image_url}
            alt="foto producto"
            style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: "#aaa", width: 48, height: 48, display: "inline-block" }}>Sin imagen</span>
        )}
        <span>
          {item.product?.description ?? "Sin descripción"}
        </span>
      </div>
    ),
  },
  {
    header: "Categoría",
    accessor: "category_id",
    order: 2,
    render: (item: PriceListItem) => item.product?.category_id ?? "-",
  },
  {
    header: "Volumen (L)",
    accessor: "volume_liters",
    order: 3,
    render: (item: PriceListItem) => item.product?.volume_liters ?? "-",
  },
  {
    header: "Precio de lista",
    accessor: "unit_price",
    order: 5,
    render: (item: PriceListItem) => `$${item.unit_price}`,
  },
  {
    header: "Retornable",
    accessor: "is_returnable",
    order: 6,
    render: (item: PriceListItem) => item.product?.is_returnable ? "Sí" : "No",
  },
  {
    header: "N° Serie",
    accessor: "serial_number",
    order: 7,
    render: (item: PriceListItem) => item.product?.serial_number ?? "-",
  },
  {
    header: (
      <div style={{ minWidth: 200, wordBreak: "break-word" }}>
        Notas
      </div>
    ),
    accessor: "notes",
    order: 8,
    render: (item: PriceListItem) => (
      <div style={{ width: 200, wordBreak: "break-word" }}>
        {item.product?.notes ?? "-"}
      </div>
    ),
  },
]);