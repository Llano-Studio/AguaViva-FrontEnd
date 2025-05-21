import React from "react";
import { ItemForm, Field } from "../../components/ItemForm";
import { User } from "../../interfaces/User";

interface UserFormProps {
  initialValues: User & { password?: string };
  onSubmit: (values: User & { password?: string }) => void;
  isEditing: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialValues, onSubmit, isEditing }) => {
  const baseFields: Field<User>[] = [
    { name: "name", label: "Nombre", validation: { required: true } },
    {
      name: "email",
      label: "Email",
      type: "email",
      validation: { required: true, isEmail: true },
    },
    { name: "role", label: "Rol", validation: { required: true } },
    { name: "isActive", label: "Activo", type: "checkbox" },
  ];

  const fields: Field<User & { password?: string }>[] = isEditing
    ? baseFields
    : [
        ...baseFields,
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          validation: { required: true, minLength: 6 },
        },
      ];

  return (
    <div
      className="animate-slide-in-right-reverse bg-white p-4 rounded-xl shadow-md max-w-xl mx-auto relative"
    >
      <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>

      <ItemForm<User & { password?: string }>
        initialValues={initialValues}
        onSubmit={onSubmit}
        fields={fields}
      />
    </div>
  );
};

export default UserForm;
