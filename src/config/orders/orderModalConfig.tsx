import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const orderModalConfig = sortByOrder([
  { label: "ID", accessor: "order_id", order: 1 },
  { label: "Cliente", accessor: "customer.name", order: 2 },
  { label: "Tipo", accessor: "order_type", order: 3 },
  { 
    label: "Fecha Pedido", 
    accessor: "order_date", 
    order: 4,
    render: (value: string) => formatDateForView(value)
  },
  { 
    label: "Fecha Entrega", 
    accessor: "scheduled_delivery_date", 
    order: 5,
    render: (value: string) => formatDateForView(value)
  },
  { label: "Estado", accessor: "status", order: 6 },
  { label: "Total", accessor: "total_amount", order: 7 },
  { label: "Notas", accessor: "notes", order: 8 },
]);

// Configuración de los productos de la orden
export const orderProductsConfig = [
  { 
    header: "", 
    accessor: "image_url", 
    render: (item: any) => (
      <img 
        src={item.image_url} 
        alt="Producto" 
        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "4px" }} 
      />
    )
  },
  { 
    header: "Descripción", 
    accessor: "product.description", 
    render: (item: any) => item.product?.description || "Sin descripción"
  },
  { header: "Cantidad", accessor: "quantity" },
  { header: "Precio Unitario", accessor: "unit_price" },
  { header: "Subtotal", accessor: "subtotal" },
];