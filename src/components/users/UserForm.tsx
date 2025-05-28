import React from "react";
import { ItemForm, Field } from "../common/ItemForm";
import { User } from "../../interfaces/User";
import useUsers from "../../hooks/useUsers";
import { userFields, passwordField } from "../../config/UserFields";

interface UserFormProps {
  onCancel: () => void;
  isEditing: boolean;
  userToEdit?: User;
  refreshUsers: () => Promise<any>;
}

const UserForm: React.FC<UserFormProps> = ({ onCancel, isEditing, userToEdit, refreshUsers }) => {
  const { createUser, updateUser } = useUsers();

  const emptyUser: User & { password?: string } = {
    id: 0,
    name: "",
    email: "",
    role: "USER",
    isActive: true,
    createdAt: "",
    updatedAt: "",
    password: ""
  };

  const initialValues = isEditing && userToEdit 
    ? { ...userToEdit, password: "" }
    : emptyUser;

  // Usa los campos configurados
  const fields: Field<User & { password?: string }>[] = isEditing
    ? userFields
    : [...userFields, passwordField];

  const handleSubmit = async (values: User & { password?: string }) => {
    try {
      let success = false;
      if (isEditing && userToEdit) {
        success = await updateUser(userToEdit.id, {
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive
        });
      } else {
        if (!values.password) {
          throw new Error("La contraseña es requerida para nuevos usuarios");
        }
        success = await createUser({
          name: values.name,
          email: values.email,
          password: values.password
        });
      }

      if (success) {
        await refreshUsers();
        onCancel();
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  return (
    <ItemForm<User & { password?: string }>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      fields={fields}
    />
  );
};

export default UserForm;