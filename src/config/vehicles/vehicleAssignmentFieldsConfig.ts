import { Field } from "../../interfaces/Common";

export const vehicleUserAssignmentFields: Field<any>[] = [
  {
    name: "userIds",
    label: "Usuarios asignados",
    type: "select",
    multiple: true,
    options: [], // Se llenará dinámicamente en el formulario
    validation: { required: true },
    order: 1,
  },
];