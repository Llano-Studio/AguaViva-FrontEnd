import { Field } from "../../components/common/ItemForm";
import { CreateProductDTO, Product } from "../../interfaces/Product";
import { Column } from "../../components/common/DataTable";
import { sortByOrder } from "../../utils/sortByOrder";

// Función para generar los campos del formulario de productos
export const productFields = (
  categories: { label: string; value: number }[],
  defaultCategoryId?: number // Valor por defecto para el campo de categorías
): Field<CreateProductDTO>[] => {
  return sortByOrder([
    {
      name: "category_id",
      label: "Categoría",
      type: "select",
      options: categories,
      validation: { required: true },
      order: 1,
      defaultValue: defaultCategoryId, // Asigna el valor por defecto
    },
    { name: "description", label: "Descripción", type: "text", validation: { required: true }, order: 2 },
    { name: "volume_liters", label: "Volumen (L)", type: "number", validation: { required: true }, order: 3 },
    { name: "price", label: "Precio", type: "number", validation: { required: true }, order: 4 },
    { name: "total_stock", label: "Stock", type: "number", validation: { required: true }, order: 5 },
    { name: "is_returnable", label: "Retornable", type: "checkbox", validation: { required: true }, order: 6 },
    { name: "serial_number", label: "N° de serie", type: "text", validation: {}, order: 7 },
    { name: "notes", label: "Notas", type: "text", validation: {}, order: 8 },
    { name: "productImage", label: "Imagen", type: "file", order: 9 },
  ]) as Field<CreateProductDTO>[]; // Ordena los campos por la propiedad "order"
};

// Columnas de la tabla de productos
export const productColumns: Column<Product>[] = sortByOrder([
  { header: 'Descripción', accessor: 'description', order: 1 },
  { header: 'Categoría', accessor: 'product_category.name', order: 2 },
  { header: 'Volumen (L)', accessor: 'volume_liters', order: 3 },
  { header: 'Precio', accessor: 'price', order: 4 },
  { header: 'Retornable', accessor: 'is_returnable', order: 5, render: (v: boolean) => v ? "Sí" : "No" },
  { header: 'N° de serie', accessor: 'serial_number', order: 7 },
  { header: 'Stock', accessor: 'total_stock', order: 8 },
]); // Ordena las columnas por la propiedad "order"