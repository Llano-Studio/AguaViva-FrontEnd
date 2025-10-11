import { Field } from "../../interfaces/Common";

export const clientPaymentFormFields: Field<any>[] = [
  {
    name: "amount",
    label: "Monto",
    type: "number",
    validation: { required: true, min: 1 },
    order: 0,
  },
  {
    name: "payment_method",
    label: "Método de pago",
    type: "select",
    options: [
      { label: "Efectivo", value: "EFECTIVO" },
      { label: "Transferencia", value: "TRANSFERENCIA" },
      { label: "Tarjeta", value: "TARJETA" },
      { label: "Mercado Pago", value: "MERCADO_PAGO" },
    ],
    validation: { required: true },
    order: 1,
  },
  {
    name: "payment_date",
    label: "Fecha y hora",
    type: "datetime-local",
    validation: { required: true },
    order: 2,
  },
  {
    name: "reference",
    label: "Referencia",
    type: "text",
    validation: { required: false },
    order: 3,
  },
  {
    name: "notes",
    label: "Notas",
    type: "textarea",
    validation: { required: false },
    order: 4,
  },
];