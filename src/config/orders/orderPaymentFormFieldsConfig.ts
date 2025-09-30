import { Field } from "../../interfaces/Common";

type Option = { label: string; value: number };

export const orderPaymentFormFields = (paymentMethodOptions: Option[] = []): Field<any>[] => [
  {
    name: "amount",
    label: "Monto",
    type: "number",
    validation: { required: true, min: 1 },
    order: 0,
  },
  {
    name: "payment_method_id",
    label: "Método de pago",
    type: "select",
    options: paymentMethodOptions,
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
    name: "transaction_reference",
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