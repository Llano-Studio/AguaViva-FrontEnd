import { Field } from "../../components/common/ItemForm";
import { User } from "../../interfaces/User";
import { Column } from "../../components/common/DataTable";
import { sortByOrder } from "../../utils/sortByOrder";
import { renderRoleLabel } from "../../utils/roleLabels";


// Campos del formulario de usuario (ya ordenados por order)
export const userFields = sortByOrder([
  { name: "name", label: "Nombre", validation: { required: true }, order: 1 },
  {
    name: "email",
    label: "Email",
    type: "email",
    validation: { required: true, isEmail: true },
    order: 2,
  },
  { 
    name: "role",
    label: "Rol", 
    type: "select",
    options: [
      { label: "Administrativo", value: "ADMINISTRATIVE" },
      { label: "Superadministrador", value: "SUPERADMIN" },
      { label: "Chofer", value: "DRIVERS" }
    ],
    validation: { required: true },
    order: 3,
  },
  { name: "isActive", 
    label: "Activo", 
    type: "checkbox", 
    order: 4 
  },
  {
    name: "profileImage",
    label: "Imagen de perfil",
    type: "file",
    order: 4,
  },
] as Field<User & { password?: string }>[]);

// Campo extra para creación
export const passwordField: Field<User & { password?: string }> = {
  name: "password",
  label: "Contraseña",
  type: "password",
  validation: { required: true, minLength: 6 },
  order: 5,
};

// Columnas de la tabla de usuarios (agregando order)
export const userColumns: Column<User>[] = sortByOrder([
  { header: 'Nombre', accessor: 'name', order: 1 },
  { header: 'Email', accessor: 'email', order: 2 },
  { 
    header: 'Rol', 
    accessor: 'role',
    order: 3,
    render: (value: string) => renderRoleLabel(value)
  },
  { 
    header: 'Activo', 
    accessor: 'isActive',
    order: 4,
    render: (value: boolean) => value ? 'Sí' : 'No'
  }
]);