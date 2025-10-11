import { Field } from "../../interfaces/Common";

export const clientComodatoFields: Field<any>[] = [
  { name: "article_description", label: "Producto", type: "search", validation: { required: true } },
  { name: "quantity", label: "Cantidad", type: "number", validation: { required: true } },
  { name: "delivery_date", label: "Fecha entrega", type: "date", validation: { required: true } },
  { name: "expected_return_date", label: "Fecha devolución esperada", type: "date" },
  {
    name: "status",
    label: "Estado",
    type: "select",
    options: [
      { label: "Activo", value: "ACTIVE" },
      { label: "Devuelto", value: "RETURNED" },
      { label: "Inactivo", value: "INACTIVE" },
    ],
    validation: { required: true },
    defaultValue: "ACTIVE",
  },
  { name: "deposit_amount", label: "Depósito", type: "number" },
  { name: "monthly_fee", label: "Cuota mensual", type: "number" },
  { name: "brand", label: "Marca", type: "text" },
  { name: "model", label: "Modelo", type: "text" },
  { name: "notes", label: "Notas", type: "textarea" },
  { name: "contract_image", label: "Contrato comodato", type: "file"},
];