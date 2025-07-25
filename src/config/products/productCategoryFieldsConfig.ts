import { Field, Column } from "../../interfaces/Common";
import { CreateProductCategoryDTO, ProductCategory } from "../../interfaces/ProductCategories";

export const productCategoryFields: Field<CreateProductCategoryDTO>[] = [
  {
    name: "name",
    label: "Nombre de la categoría",
    type: "text",
    validation: { required: true },
    order: 1,
  },
];

export const productCategoryColumns: Column<ProductCategory>[] = [
  { header: "ID", accessor: "category_id", order: 1 },
  { header: "Nombre", accessor: "name", order: 2 },
];