import { sortByOrder } from "../../utils/sortByOrder";

export const productModalConfig = sortByOrder([
  {
    label: "",
    accessor: "image_url",
    className: "modal-item-image",
    order: 1,
    render: (value: string) =>
      value ? (
        <img
          src={value}
          alt="Imagen de producto"
          style={{ width: 120, height: 120, borderRadius: "6px", objectFit: "cover" }}
        />
      ) : (
        "Sin imagen"
      ),
  },
  { label: "Descripción", accessor: "description", className: "modal-item-1", order: 2 },
  { label: "Categoría", accessor: "product_category.name", className: "modal-item-2", order: 3 },
  { label: "Volumen (L)", accessor: "volume_liters", className: "modal-item-3", order: 4 },
  { label: "Precio", accessor: "price", className: "modal-item-4", order: 5 },
  { label: "Retornable", accessor: "is_returnable", className: "modal-item-5", order: 6, render: (v: boolean) => v ? "Sí" : "No" },
  { label: "N° de serie", accessor: "serial_number", className: "modal-item-6", order: 7 },
  { label: "Notas", accessor: "notes", className: "modal-item-7", order: 8 },
  { label: "Stock", accessor: "total_stock", className: "modal-item-8", order: 9 },
]);