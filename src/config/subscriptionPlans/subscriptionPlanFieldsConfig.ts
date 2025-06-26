import { Field } from "../../components/common/ItemForm";
import { SubscriptionPlan, CreateSubscriptionPlanDTO } from "../../interfaces/SubscriptionPlan";
import { Column } from "../../components/common/DataTable";
import { sortByOrder } from "../../utils/sortByOrder";

// Campos del formulario de abono (ordenados por order)
export const subscriptionPlanFields = sortByOrder([
  { name: "name", label: "Nombre", validation: { required: true }, order: 1 },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    validation: { required: true },
    order: 2,
  },
  { 
    name: "price",
    label: "Precio", 
    type: "number",
    validation: { required: true },
    order: 3,
  },
  { 
    name: "default_cycle_days",
    label: "Días por ciclo", 
    type: "number",
    validation: { required: true },
    order: 4,
  },
  { 
    name: "default_deliveries_per_cycle",
    label: "Entregas por ciclo", 
    type: "number",
    validation: { required: true },
    order: 5,
  },
  { 
    name: "is_active", 
    label: "Activo", 
    type: "checkbox", 
    order: 6 
  },
] as Field<CreateSubscriptionPlanDTO>[]);

// Columnas de la tabla de abonos
export const subscriptionPlanColumns: Column<SubscriptionPlan>[] = sortByOrder([
  { header: 'Nombre', accessor: 'name', order: 1 },
  { header: 'Descripción', accessor: 'description', order: 2 },
  { header: 'Precio', accessor: 'price', order: 3 },
  { header: 'Días por ciclo', accessor: 'default_cycle_days', order: 4 },
  { header: 'Entregas/ciclo', accessor: 'default_deliveries_per_cycle', order: 5 },
  { 
    header: 'Activo', 
    accessor: 'is_active',
    order: 6,
    render: (value: boolean) => value ? 'Sí' : 'No'
  }
]);