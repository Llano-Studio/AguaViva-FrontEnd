import { Field, Column } from "../../interfaces/Common";
import { CreateClientDTO, Client } from "../../interfaces/Client";
import { sortByOrder } from "../../utils/sortByOrder";
import { dependentLocationFields } from "../common/dependentLocationFields";
import { renderPaymentSemaphoreLabel } from "../../utils/paymentSemaphoreLabels";

export const clientFields = (
  countries: { label: string; value: number }[],
  provinces: { label: string; value: number }[],
  localities: { label: string; value: number }[],
  zones: { label: string; value: number }[]
): Field<CreateClientDTO>[] => {
  return sortByOrder([
    { name: "name", label: "Nombre", validation: { required: true }, order: 0 },
    { name: "phone", label: "Teléfono", validation: { required: true }, order: 1 },
    { name: "additionalPhones", label: "Teléfonos adicionales", validation: { required: false }, order: 2 },
    { name: "address", label: "Dirección", validation: { required: true }, order: 3 },
    { name: "alias", label: "Empresa", validation: { required: false }, order: 4 },
    { name: "taxId", label: "CUIT/CUIL", type: "taxId", placeholder: "XX-XXXXXXXX-X", validation: { required: false }, order: 5 },
    ...dependentLocationFields<CreateClientDTO>(countries, provinces, localities, zones).map(f => ({ ...f, order: f.order! + 5 })),
    { name: "registrationDate", label: "Fecha de alta", type: "date", validation: { required: true }, order: 10 },
    { 
      name: "type", 
      label: "Tipo", 
      type: "select", 
      options: [
        { label: "Individual", value: "INDIVIDUAL" },
        { label: "Abono", value: "PLAN" }
      ],
      validation: { required: true },
      order: 11
    },
    { name: "notes", label: "Notas", validation: { required: false }, type: "textarea", order: 12 },
    { name: "is_active", label: "Activo", validation: { required: true }, type: "checkbox", order: 13 },

  ]);
};

// Columnas de la tabla de clientes (sin cambios)
export const clientColumns: Column<Client>[] = sortByOrder([
  { header: 'Nombre', accessor: 'name', order: 0 },
  { header: 'ID Cliente', accessor: 'person_id', order: 1 },
  { header: 'Teléfono', accessor: 'phone', order: 2 },
  { header: 'Dirección', accessor: 'address', order: 3 },
  { header: 'Empresa', accessor: 'alias', order: 4,
    render: (value: string) => value ? value : '-' 
  },
  { header: 'CUIT/CUIL', accessor: 'taxId', order: 5, require: false },
  { header: 'Localidad', accessor: 'locality.name', order: 6 },
  { header: 'Zona', accessor: 'zone.name', order: 7 },
  { 
    header: 'Tipo', 
    accessor: 'type',
    order: 8,
    render: (value: string) => value === 'PLAN' ? 'Abono' : 'Individual'
  },
  { 
    header: 'Estado de pago', 
    accessor: 'payment_semaphore_status',
    order: 9,
    render: (value: string) => renderPaymentSemaphoreLabel(value)
  }
]);