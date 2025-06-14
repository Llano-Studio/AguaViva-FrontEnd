import React, { useMemo } from "react";
import { ItemForm, Field } from "../common/ItemForm";
import { User } from "../../interfaces/User";
import useUsers from "../../hooks/useUsers";
import { userFields, passwordField } from "../../config/users/userFieldsConfig";
import { useForm } from "react-hook-form";

interface UserFormProps {
  onCancel: () => void;
  isEditing: boolean;
  userToEdit?: User;
  refreshUsers: () => Promise<any>;
  class?: string;
}

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

const UserForm: React.FC<UserFormProps> = ({
  onCancel,
  isEditing,
  userToEdit,
  refreshUsers,
  class: classForm,
}) => {
  const { createUser, updateUser } = useUsers();

  const initialValues = useMemo(
    () =>
      isEditing && userToEdit
        ? { ...userToEdit, password: "" }
        : emptyUser,
    [isEditing, userToEdit]
  );

  // Usa los campos del config y agrega el de password solo si es creación
  const fields: Field<User & { password?: string }>[] = [
    ...userFields,
    ...(isEditing ? [] : [passwordField]),
  ];

  // React Hook Form
  const form = useForm<User & { password?: string }>({
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: any) => {
    try {
      let success = false;
      if (values instanceof FormData) {
        if (isEditing && userToEdit) {
          success = await updateUser(userToEdit.id, values, true);
        } else {
          if (!values.get("password")) {
            throw new Error("La contraseña es requerida para nuevos usuarios");
          }
          success = await createUser(values, true);
        }
      } else {
        const filtered = { ...values };
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
            isActive: filtered.isActive,
            role: filtered.role,
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
      {...form}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      fields={fields}
      class={classForm}
    />
  );
};

export default UserForm;