import { Field } from "../../components/common/ItemForm";
import { CreateClientDTO, Client } from "../../interfaces/Client";
import { Column } from "../../components/common/DataTable";

// Campos del formulario de cliente (con order)
export const clientFields = ([
  { name: "name", label: "Nombre", validation: { required: true }, order: 1 },
  { name: "phone", label: "Teléfono", validation: { required: true }, order: 2 },
  { name: "address", label: "Dirección", validation: { required: true }, order: 3 },
  { name: "taxId", label: "CUIT/CUIL", validation: { required: true }, order: 4 },
  { name: "localityId", label: "Localidad", type: "number", validation: { required: true }, order: 5 },
  { name: "zoneId", label: "Zona", type: "number", validation: { required: true }, order: 6 },
  { name: "registrationDate", label: "Fecha de alta", type: "date", validation: { required: true }, order: 7 },
  { 
    name: "type", 
    label: "Tipo", 
    type: "select", 
    options: [
      { label: "Individual", value: "INDIVIDUAL" },
      { label: "Abono", value: "PLAN" }
    ],
    validation: { required: true },
    order: 8
  },
] as Field<CreateClientDTO>[])
.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// Columnas de la tabla de clientes (con order)
export const clientColumns: Column<Client>[] = [
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
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));