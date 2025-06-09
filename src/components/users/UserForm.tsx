import React from "react";
import { ItemForm, Field } from "../common/ItemForm";
import { User } from "../../interfaces/User";
import useUsers from "../../hooks/useUsers";
import { userFields, passwordField } from "../../config/users/userFieldsConfig";

interface UserFormProps {
  onCancel: () => void;
  isEditing: boolean;
  userToEdit?: User;
  refreshUsers: () => Promise<any>;
  class?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  onCancel,
  isEditing,
  userToEdit,
  refreshUsers,
  class: classForm,
}) => {
  const { createUser, updateUser } = useUsers();

  const emptyUser: User & { password?: string } = {
    id: 0,
    name: "",
    email: "",
    role: "USER",
    isActive: true,
    createdAt: "",
    updatedAt: "",
    password: "",
    profileImageUrl: "",
  };

  const initialValues =
    isEditing && userToEdit
      ? { ...userToEdit, password: "" }
      : emptyUser;

  // Usa los campos del config y agrega el de password solo si es creación
  const fields: Field<User & { password?: string }>[] = [
    ...userFields,
    ...(isEditing ? [] : [passwordField]),
  ];

  const handleSubmit = async (values: any) => {
    try {
      let success = false;
      if (values instanceof FormData) {
        // Elimina isActive y role del FormData antes de enviarlo
        values.delete("isActive");
        values.delete("role");

        if (isEditing && userToEdit) {
          success = await updateUser(userToEdit.id, values, true);
        } else {
          if (!values.get("password")) {
            throw new Error("La contraseña es requerida para nuevos usuarios");
          }
          success = await createUser(values, true);
        }
      } else {
        // fallback por si no hay archivo
        const filtered = { ...values };
        delete filtered.isActive;
        delete filtered.role;

        if (isEditing && userToEdit) {
          success = await updateUser(userToEdit.id, filtered);
        } else {
          if (!filtered.password) {
            throw new Error("La contraseña es requerida para nuevos usuarios");
          }
          success = await createUser({
            name: filtered.name,
            email: filtered.email,
            password: filtered.password,
          });
        }
      }

      if (success) {
        await refreshUsers();
        onCancel();
      }
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  return (
    <ItemForm<User & { password?: string }>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      fields={fields}
      class={classForm}
    />
  );
};

export default UserForm;