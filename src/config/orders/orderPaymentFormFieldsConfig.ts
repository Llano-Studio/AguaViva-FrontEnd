import { Field } from "../../interfaces/Common";

type Option = { label: string; value: number };

// Campos para crear pago (usa ID numérico del método de pago)
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

// NUEVO: Campos para editar pago (usa key string del método de pago, ej: "EFECTIVO")
type OptionKey = { label: string; value: string };

export const orderPaymentFormFieldsEdit = (
  paymentMethodKeyOptions: OptionKey[] = []
): Field<any>[] => [
  {
    name: "amount",
    label: "Monto",
    type: "number",
    validation: { required: true },
    order: 0,
  },
  {
    name: "payment_method",
    label: "Método de pago",
    type: "select",
    options: paymentMethodKeyOptions,
    validation: { required: true },
    order: 1,
    menuMaxHeight: 120,
  } as any,
  {
    name: "payment_date",
    label: "Fecha de pago",
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