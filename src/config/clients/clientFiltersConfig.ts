import { FilterField } from "../../components/common/FilterDrawer"; // Ajusta la ruta si es necesario

export const clientFilters: FilterField[] = [
  {
    name: "type",
    label: "Tipo",
    type: "checkbox",
    options: [
      { label: "Individual", value: "INDIVIDUAL" },
      { label: "Empresa", value: "COMPANY" },
    ],
  },
  {
    name: "zoneId",
    label: "Zona",
    type: "select",
    options: [], // Llena dinámicamente si es necesario
  },
  {
    name: "localityId",
    label: "Localidad",
    type: "select",
    options: [], // Llena dinámicamente si es necesario
  },
  {
    name: "payment_semaphore_status",
    label: "Semáforo de pago",
    type: "checkbox",
    options: [
      { label: "Verde", value: "GREEN" },
      { label: "Amarillo", value: "YELLOW" },
      { label: "Rojo", value: "RED" },
    ],
  },
];