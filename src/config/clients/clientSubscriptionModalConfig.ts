import { sortByOrder } from "../../utils/sortByOrder";
import { formatDateForView } from "../../utils/formateDateForView";

export const clientSubscriptionModalConfig = sortByOrder([
  { label: "Abono", accessor: "subscription_plan.name", order: 0 },
  { label: "Precio", accessor: "subscription_plan.price", order: 1 },
  { label: "Descripción", accessor: "subscription_plan.description", order: 2 },
  { label: "Fecha inicio", accessor: "start_date", order: 3, render: (v: string) => formatDateForView(v) },
  { label: "Día de recolección", accessor: "collection_day", order: 4 },
  { label: "Modo de pago", accessor: "payment_mode", order: 5, render: (v: string) => v === "ADVANCE" ? "Adelantado" : "Vencido" },
  { label: "Día de vencimiento", accessor: "payment_due_day", order: 6 },
  { label: "Estado", accessor: "status", order: 7 },
  { label: "Horario preferido", accessor: "delivery_preferences.preferred_time_range", order: 8 },
  {
    label: "Días preferidos",
    accessor: "delivery_preferences.preferred_days",
    order: 9,
    render: (v: string[] | string) => {
      if (!v) return "";
      const arr = Array.isArray(v) ? v : v.split(",");
      return arr.map(day => daysMap[day.trim()] || day).join(", ");
    }
  },
  { label: "Evitar horarios", accessor: "delivery_preferences.avoid_times", order: 10, render: (v: string[]) => v?.join(", ") },
  { label: "Instrucciones especiales", accessor: "delivery_preferences.special_instructions", order: 11 },
  { label: "Notas", accessor: "notes", order: 12 },
]);

const daysMap: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};