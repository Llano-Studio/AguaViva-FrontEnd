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
      { label: "Tarjeta débito", value: "TARJETA_DEBITO" },
      { label: "Tarjeta crédito", value: "TARJETA_CREDITO" },
      { label: "Cheque", value: "CHEQUE" },
      { label: "Mercado Pago / QR", value: "MOBILE_PAYMENT" },
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


type OptionKey = { label: string; value: string };

export const clientPaymentFormFieldsEdit = (
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
