import { Field } from "../../components/common/ItemForm";
import { User } from "../../interfaces/User";
import { Column } from "../../components/common/DataTable";

// Campos del formulario de usuario
export const userFields: Field<User & { password?: string }>[] = [
  { name: "name", label: "Nombre", validation: { required: true } },
  {
    name: "email",
    label: "Email",
    type: "email",
    validation: { required: true, isEmail: true },
  },
  { 
    name: "role", 
    label: "Rol", 
    type: "select",
    options: [
      { label: "Usuario", value: "USER" },
      { label: "Administrador", value: "ADMIN" }
    ],
    validation: { required: true } 
  },
  { name: "isActive", label: "Activo", type: "checkbox" },
];

// Campo extra para creación
export const passwordField: Field<User & { password?: string }> = {
  name: "password",
  label: "Contraseña",
  type: "password",
  validation: { required: true, minLength: 6 },
};

// Columnas de la tabla de usuarios
export const userColumns: Column<User>[] = [
  { header: 'Nombre', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { 
    header: 'Rol', 
    accessor: 'role',
    render: (value: string) => value === 'ADMIN' ? 'Administrador' : 'Usuario'
  },
  { 
    header: 'Activo', 
    accessor: 'isActive',
    render: (value: boolean) => value ? 'Sí' : 'No'
  }
];