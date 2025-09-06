import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";
import { renderStatusOrderLabel } from "../../utils/statusOrderLabels";
import { renderTypeOrderLabel } from "../../utils/typeOrderLabels";

export const orderModalConfig = sortByOrder([
  { label: "ID", accessor: "id", order: 1 },
  { label: "Cliente", accessor: "customer.name", order: 2 },
  { 
    label: "Dirección", 
    accessor: "customer.address", // accessor básico
    order: 2,
    render: (value: string, row: any) => {
      return row.delivery_address || row.person?.address || "";
    }
  },
  { 
    label: "Telefono", 
    accessor: "customer.phone", // accessor básico
    order: 3,
    render: (value: string, row: any) => {
      return row.customer?.phone || row.person?.phone || "";
    }
  },
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
  { label: "Tipo", accessor: "order_type", order: 6,
    render: (value: string) => renderTypeOrderLabel(value)
  },
  { label: "Estado", accessor: "status", order: 7,
    render: (value: string) => renderStatusOrderLabel(value)
   },
  { label: "Delivey", accessor: "requires_delivery", order: 8,
    render: (value: boolean) => value ? "Sí" : "No"
   },
  { label: "Monto pagado", accessor: "paid_amount", order: 9 },
  { label: "Monto total", accessor: "total_amount", order: 10 },
  { label: "Notas", accessor: "notes", order: 11

   },
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
    render: (item: any) => item.product?.description || item.description || "Sin nombre"
  },
  { header: "Cantidad", accessor: "quantity" },
  { header: "Precio Unitario", accessor: "unit_price",
    render: (item: any) => item.unit_price || "-"
   },
  { header: "Subtotal", accessor: "subtotal",
    render: (item: any) => item.subtotal || "-"
  },
];

