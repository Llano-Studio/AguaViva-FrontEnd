import { Field } from "../../components/common/ItemForm";
import { CreatePriceListDTO } from "../../interfaces/PriceList";
import { Column } from "../../components/common/DataTable";
import { PriceList } from "../../interfaces/PriceList";
import { sortByOrder } from "../../utils/sortByOrder";

// Campos del formulario de lista de precios
export const priceListFields: Field<CreatePriceListDTO>[] = sortByOrder([
  { name: "name", label: "Nombre", validation: { required: true }, order: 1 },
  { name: "description", label: "Descripción", type: "textarea", validation: { required: true }, order: 2 },
  { name: "effective_date", label: "Fecha de vigencia", type: "date", validation: { required: true }, order: 3 },
  { name: "is_default", label: "¿Es la lista por defecto?", type: "checkbox", order: 4 },
  { name: "active", label: "Activa", type: "checkbox", order: 5 },
]);

// Columnas de la tabla de listas de precios
export const priceListColumns: Column<PriceList>[] = sortByOrder([
  { header: "Nombre", accessor: "name", order: 1 },
  { header: "Descripción", accessor: "description", order: 2 },
  { header: "Fecha Vigencia", accessor: "effective_date", order: 3 },
  { header: "Por defecto", accessor: "is_default", order: 4, render: (value: boolean) => value ? 'Sí' : 'No' },
  { header: "Activa", accessor: "active", order: 5, render: (value: boolean) => value ? 'Sí' : 'No' },
]);