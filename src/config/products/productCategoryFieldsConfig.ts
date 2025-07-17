import { Field } from "../../components/common/ItemForm";
import { CreateProductCategoryDTO, ProductCategory } from "../../interfaces/ProductCategories";
import { Column } from "../../components/common/DataTable";

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