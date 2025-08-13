import { Field } from "../../interfaces/Common";

export const clientSubscriptionFields: Field<any>[] = [
  {
    name: "subscription_plan_id",
    label: "Plan de abono",
    type: "select",
    options: [], // Deberás cargar dinámicamente los planes disponibles
    validation: { required: true },
    order: 0,
  },
  {
    name: "start_date",
    label: "Fecha de inicio",
    type: "date",
    validation: { required: true },
    order: 1,
  },
  {
    name: "end_date",
    label: "Fecha de fin",
    type: "date",
    validation: { required: true },
    order: 2,
  },
  {
    name: "status",
    label: "Estado",
    type: "select",
    options: [
      { label: "Activo", value: "ACTIVE" },
      { label: "Pausado", value: "PAUSED" },
      { label: "Cancelado", value: "CANCELLED" },
    ],
    validation: { required: true },
    order: 3,
  },


  {
    name: "delivery_preferences.preferred_time_range_start",
    label: "Horario preferido (inicio)",
    type: "time",
    validation: { required: false },
    order: 4,
  },
  {
    name: "delivery_preferences.preferred_time_range_end",
    label: "Horario preferido (fin)",
    type: "time",
    validation: { required: false },
    order: 5,
  },
  {
    name: "delivery_preferences.preferred_days",
      label: "Días preferidos",
      type: "multiselect",
      options: [
        { label: "Lunes", value: "MONDAY" },
        { label: "Martes", value: "TUESDAY" },
        { label: "Miércoles", value: "WEDNESDAY" },
        { label: "Jueves", value: "THURSDAY" },
        { label: "Viernes", value: "FRIDAY" },
        { label: "Sábado", value: "SATURDAY" },
        { label: "Domingo", value: "SUNDAY" },
      ],
      validation: { required: false },
      order: 6,
  },

  {
    name: "delivery_preferences.avoid_times_start",
    label: "Evitar horario (inicio)",
    type: "time",
    validation: { required: false },
    order: 7,
  },
  {
    name: "delivery_preferences.avoid_times_end",
    label: "Evitar horario (fin)",
    type: "time",
    validation: { required: false },
    order: 8,
  },
  {
    name: "delivery_preferences.special_instructions",
    label: "Instrucciones especiales",
    type: "textarea",
    validation: { required: false },
    order: 9,
  },
];