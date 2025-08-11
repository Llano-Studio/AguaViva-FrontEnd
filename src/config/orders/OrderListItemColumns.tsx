import { sortByOrder } from "../../utils/sortByOrder";

export const OrderListItemColumns = sortByOrder([
    {
    header: "Artículo",
    accessor: "image_url",
    render: (item: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {item?.image_url ? (
            <img
                src={item.image_url}
                alt="foto producto"
                style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4 }}
            />
            ) : (
            <span style={{ color: "#aaa", width: 48, height: 48, display: "inline-block" }}>Sin imagen</span>)}
            <span>
                {item?.product_name ?? item?.description ?? "Sin descripción"}
            </span>
        </div>
    ),
    order: 1,
    },
    { header: "Cantidad", accessor: "quantity", order: 2 },
    { header: "Precio Unidad", accessor: "price_unit", order: 3 },
    {
    header: "Abono",
    accessor: "abono_name",
    order: 4,
    render: (item) => item.abono_name && item.abono_name !== "" ? item.abono_name : "-",
    
    },
    {
    header: "Retornable",
    accessor: "is_returnable",
    order: 5,
    render: (item) => item.is_returnable ? "Sí" : "No"
    },
    { header: "Lista de precios", accessor: "price_list_name", order: 6 },
    { header: "Precio Total", accessor: "price_total_item", order: 7 },
]);