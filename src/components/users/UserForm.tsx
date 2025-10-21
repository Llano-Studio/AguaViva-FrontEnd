import React, { useMemo, useState } from "react";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common"
import { User } from "../../interfaces/User";
import useUsers from "../../hooks/useUsers";
import { userFields, passwordField } from "../../config/users/userFieldsConfig";
import { useForm } from "react-hook-form";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";

interface UserFormProps {
  onCancel: () => void;
  isEditing: boolean;
  userToEdit?: User;
  refreshUsers: () => Promise<any>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const emptyUser: User & { password?: string } = {
  id: 0,
  name: "",
  email: "",
  role: "ADMINISTRATIVE",
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
  onSuccess,
}) => {
  const { createUser, updateUser } = useUsers();
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const initialValues = useMemo(
    () =>
      isEditing && userToEdit
        ? { ...userToEdit, password: "" }
        : emptyUser,
    [isEditing, userToEdit]
  );

  const fields: Field<User & { password?: string }>[] = [
    ...userFields,
    ...(isEditing ? [] : [passwordField]),
  ];

  const form = useForm<User & { password?: string }>({
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: any) => {
    try {
      if (isEditing && userToEdit) {
        setPendingValues(values);
        setShowUpdateConfirm(true);
        return;
      }
      let success = false;
      if (values instanceof FormData) {
        if (!values.get("password")) {
          throw new Error("La contraseña es requerida para nuevos usuarios");
        }
        success = await createUser(values, true);
      } else {
        if (!values.password) {
          throw new Error("La contraseña es requerida para nuevos usuarios");
        }
        success = await createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          isActive: values.isActive,
          role: values.role,
        });
      }
      if (success) {
        await refreshUsers();
        if (onSuccess) onSuccess("Usuario creado correctamente.");
        showSnackbar("Usuario creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar usuario");
        showSnackbar("Error al guardar usuario", "error");
      }
    } catch (error: any) {
      setError(error?.message || "Error al guardar usuario");
      showSnackbar(error?.message || "Error al guardar usuario", "error");
      console.error("Error al guardar usuario:", error);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingValues || !userToEdit) return;
    try {
      let success = false;
      if (pendingValues instanceof FormData) {
        success = await updateUser(userToEdit.id, pendingValues, true);
      } else {
        success = await updateUser(userToEdit.id, pendingValues);
      }
      if (success) {
        await refreshUsers();
        if (onSuccess) onSuccess("Usuario editado correctamente.");
        showSnackbar("Usuario editado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar usuario");
        showSnackbar("Error al actualizar usuario", "error");
      }
    } catch (error: any) {
      setError(error?.message || "Error al actualizar usuario");
      showSnackbar(error?.message || "Error al actualizar usuario", "error");
      console.error("Error al actualizar usuario:", error);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<User & { password?: string }>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={fields}
        class={classForm}
      />
      {error && <div className="error-message">{error}</div>}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="usuario"
        genere="M"
      />
    </>
  );
};

export default UserForm;