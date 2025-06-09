export const clientModalConfig = [
  { label: "Nombre", accessor: "name", className: "modal-item-1", order: 1 },
  { label: "Teléfono", accessor: "phone", className: "modal-item-2", order: 2 },
  { label: "Dirección", accessor: "address", className: "modal-item-3", order: 3 },
  { label: "CUIT/CUIL", accessor: "taxId", className: "modal-item-4", order: 4 },
  { label: "Localidad", accessor: "locality.name", className: "modal-item-5", order: 5 },
  { label: "Zona", accessor: "zone.name", className: "modal-item-6", order: 6 },
  { label: "Fecha de alta", accessor: "registrationDate", className: "modal-item-7", order: 7 },
  { 
    label: "Tipo", 
    accessor: "type", 
    className: "modal-item-8", 
    order: 8,
    render: (value: string) => value === "PLAN" ? "Abono" : "Individual" 
  },
  { label: "Semáforo de pago", accessor: "payment_semaphore_status", className: "modal-item-9", order: 9 },
].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));