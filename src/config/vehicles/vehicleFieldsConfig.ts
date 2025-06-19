import { Field } from "../../components/common/ItemForm";
import { Vehicle, CreateVehicleDTO } from "../../interfaces/Vehicle";
import { Column } from "../../components/common/DataTable";
import { sortByOrder } from "../../utils/sortByOrder";

// Campos del formulario de vehículo
export const vehicleFields = sortByOrder([
  { name: "code", label: "Código", validation: { required: true }, order: 1 },
  { name: "name", label: "Nombre", validation: { required: true }, order: 2 },
  { name: "description", label: "Descripción", type: "textarea", validation: { required: true }, order: 3 },
] as Field<CreateVehicleDTO>[]);

// Columnas de la tabla de vehículos
export const vehicleColumns: Column<Vehicle>[] = sortByOrder([
  { header: "Código", accessor: "code", order: 1 },
  { header: "Nombre", accessor: "name", order: 2 },
  { header: "Descripción", accessor: "description", order: 3 },
]);