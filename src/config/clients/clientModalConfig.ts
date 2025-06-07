export const clientModalConfig = [
  { label: "Nombre", accessor: "name", className: "modal-item-1" },
  { label: "Teléfono", accessor: "phone", className: "modal-item-2" },
  { label: "Dirección", accessor: "address", className: "modal-item-3" },
  { label: "CUIT/CUIL", accessor: "taxId", className: "modal-item-4" },
  { label: "Localidad", accessor: "locality.name", className: "modal-item-5" },
  { label: "Zona", accessor: "zone.name", className: "modal-item-6" },
  { label: "Fecha de alta", accessor: "registrationDate", className: "modal-item-7" },
  { label: "Tipo", accessor: "type", className: "modal-item-8", render: (value: string) => value === "COMPANY" ? "Empresa" : "Individual" },
  { label: "Semáforo de pago", accessor: "payment_semaphore_status", className: "modal-item-9" },
];