import { Field } from "../../components/common/ItemForm";
import { CreateProductDTO, Product } from "../../interfaces/Product";
import { Column } from "../../components/common/DataTable";

// Campos del formulario de artículo
export const productFields = ([
  { name: "category_id", label: "Categoría", type: "number", validation: { required: true }, order: 1 },
  { name: "description", label: "Descripción", validation: { required: true }, order: 2 },
  { name: "volume_liters", label: "Volumen (L)", type: "number", validation: { required: true }, order: 3 },
  { name: "price", label: "Precio", type: "number", validation: { required: true }, order: 4 },
  { name: "is_returnable", label: "Retornable", type: "checkbox", validation: { required: true }, order: 5 },
  { name: "serial_number", label: "N° de serie", validation: {}, order: 6 },
  { name: "notes", label: "Notas", validation: {}, order: 7 },
  { name: "productImage", label: "Imagen", type: "file", order: 8 },
] as Field<CreateProductDTO>[])
.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// Columnas de la tabla de artículos
export const productColumns: Column<Product>[] = [
  { header: 'Descripción', accessor: 'description', order: 1 },
  { header: 'Categoría', accessor: 'product_category.name', order: 2 },
  { header: 'Volumen (L)', accessor: 'volume_liters', order: 3 },
  { header: 'Precio', accessor: 'price', order: 4 },
  { header: 'Retornable', accessor: 'is_returnable', order: 5, render: (v: boolean) => v ? "Sí" : "No" },
  { header: 'N° de serie', accessor: 'serial_number', order: 6 },
  { header: 'Stock', accessor: 'total_stock', order: 7 },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));