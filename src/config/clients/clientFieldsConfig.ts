import { Field } from "../../components/common/ItemForm";
import { CreateClientDTO, Client } from "../../interfaces/Client";
import { Column } from "../../components/common/DataTable";
import { sortByOrder } from "../../utils/sortByOrder";
import { dependentLocationFields } from "../common/dependentLocationFields";

export const clientFields = (
  countries: { label: string; value: number }[],
  provinces: { label: string; value: number }[],
  localities: { label: string; value: number }[],
  zones: { label: string; value: number }[]
): Field<CreateClientDTO>[] => {
  return sortByOrder([
    { name: "name", label: "Nombre", validation: { required: true }, order: 1 },
    { name: "phone", label: "Teléfono", validation: { required: true }, order: 2 },
    { name: "address", label: "Dirección", validation: { required: true }, order: 3 },
    { name: "taxId", label: "CUIT/CUIL", validation: { required: true }, order: 4 },
    ...dependentLocationFields<CreateClientDTO>(countries, provinces, localities, zones).map(f => ({ ...f, order: f.order! + 4 })),
    { name: "registrationDate", label: "Fecha de alta", type: "date", validation: { required: true }, order: 9 },
    { 
      name: "type", 
      label: "Tipo", 
      type: "select", 
      options: [
        { label: "Individual", value: "INDIVIDUAL" },
        { label: "Abono", value: "PLAN" }
      ],
      validation: { required: true },
      order: 10
    },
  ]);
};

// Columnas de la tabla de clientes (sin cambios)
export const clientColumns: Column<Client>[] = sortByOrder([
  { header: 'Nombre', accessor: 'name', order: 1 },
  { header: 'Teléfono', accessor: 'phone', order: 2 },
  { header: 'Dirección', accessor: 'address', order: 3 },
  { header: 'CUIT/CUIL', accessor: 'taxId', order: 4 },
  { header: 'Localidad', accessor: 'locality.name', order: 5 },
  { header: 'Zona', accessor: 'zone.name', order: 6 },
  { 
    header: 'Tipo', 
    accessor: 'type',
    order: 7,
    render: (value: string) => value === 'PLAN' ? 'Abono' : 'Individual'
  },
  { 
    header: 'Semáforo de pago', 
    accessor: 'payment_semaphore_status',
    order: 8,
    render: (value: string) => {
      if (value === "GREEN") return "Verde";
      if (value === "YELLOW") return "Amarillo";
      if (value === "RED") return "Rojo";
      if (value === "NONE") return "Gris";
      return value;
    }
  }
]);