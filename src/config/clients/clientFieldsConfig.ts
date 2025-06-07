import { Field } from "../../components/common/ItemForm";
import { CreateClientDTO, Client } from "../../interfaces/Client";
import { Column } from "../../components/common/DataTable";

export const clientFields: Field<CreateClientDTO>[] = [
  { name: "name", label: "Nombre", validation: { required: true } },
  { name: "phone", label: "Teléfono", validation: { required: true } },
  { name: "address", label: "Dirección", validation: { required: true } },
  { name: "taxId", label: "CUIT/CUIL", validation: { required: true } },
  { name: "localityId", label: "Localidad", type: "number", validation: { required: true } },
  { name: "zoneId", label: "Zona", type: "number", validation: { required: true } },
  { name: "registrationDate", label: "Fecha de alta", type: "date", validation: { required: true } },
  { 
    name: "type", 
    label: "Tipo", 
    type: "select", 
    options: [
      { label: "Individual", value: "INDIVIDUAL" },
      { label: "Empresa", value: "COMPANY" }
    ],
    validation: { required: true }
  },
];

// Columnas de la tabla de clientes
export const clientColumns: Column<Client>[] = [
  { header: 'Nombre', accessor: 'name' },
  { header: 'Teléfono', accessor: 'phone' },
  { header: 'Dirección', accessor: 'address' },
  { header: 'CUIT/CUIL', accessor: 'taxId' },
  { header: 'Localidad', accessor: 'locality.name' },
  { header: 'Zona', accessor: 'zone.name' },
  { 
    header: 'Tipo', 
    accessor: 'type',
    render: (value: string) => value === 'COMPANY' ? 'Empresa' : 'Individual'
  },
  { 
    header: 'Semáforo de pago', 
    accessor: 'payment_semaphore_status',
    render: (value: string) => {
      if (value === "GREEN") return "Verde";
      if (value === "YELLOW") return "Amarillo";
      if (value === "RED") return "Rojo";
      return value;
    }
  }
];