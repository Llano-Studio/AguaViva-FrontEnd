import { sortByOrder } from "../../utils/sortByOrder";

export const clientSubscriptionModalConfig = sortByOrder([
  { label: "Abono", accessor: "subscription_plan.name", order: 0 },
  { label: "Precio", accessor: "subscription_plan.price", order: 1 },
  { label: "Descripción", accessor: "subscription_plan.description", order: 2 },
  { label: "Fecha inicio", accessor: "start_date", order: 3 },
  { label: "Estado", accessor: "status", order: 4 },
  { label: "Horario preferido", accessor: "delivery_preferences.preferred_time_range", order: 5 },
  {
    label: "Días preferidos",
    accessor: "delivery_preferences.preferred_days",
    order: 6,
    render: (v: string[] | string) => {
      if (!v) return "";
      const arr = Array.isArray(v) ? v : v.split(",");
      return arr.map(day => daysMap[day.trim()] || day).join(", ");
    }
  },
  { label: "Evitar horarios", accessor: "delivery_preferences.avoid_times", order: 7, render: (v: string[]) => v?.join(", ") },
  { label: "Instrucciones especiales", accessor: "delivery_preferences.special_instructions", order: 8 },
  { label: "Notas", accessor: "notes", order: 9 },
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