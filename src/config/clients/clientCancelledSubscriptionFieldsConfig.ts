import { Field } from "../../interfaces/Common";

export const clientCancelledSubscriptionFields: Field<any>[] = [
  {
    name: "scheduled_collection_date",
    label: "Fecha de retiro (programada)",
    type: "date",
    validation: { required: true },
    order: 0,
  },
  {
    name: "notes",
    label: "Notas",
    type: "textarea",
    validation: { required: false, maxLength: 500 },
    order: 1,
  },
];