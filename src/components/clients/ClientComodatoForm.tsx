import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { clientComodatoFields } from "../../config/clients/clientComodatoFieldsConfig";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { useSnackbar } from "../../context/SnackbarContext";

interface ClientComodatoFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<any> | any;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

const ClientComodatoForm: React.FC<ClientComodatoFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
  error,
  isEditing,
}) => {
  const { showSnackbar } = useSnackbar();
  const fields: Field<any>[] = clientComodatoFields;

  const form = useForm({
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: any) => {
    try {
      await Promise.resolve(onSubmit(values));
      showSnackbar(
        isEditing ? "Comodato actualizado correctamente." : "Comodato creado correctamente.",
        "success"
      );
    } catch (e: any) {
      showSnackbar(e?.message || "Error al guardar el comodato", "error");
    }
  };

  useEffect(() => {
    if (error) showSnackbar(error, "error");
  }, [error, showSnackbar]);

  return (
    <>
      <ItemForm
        {...form}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        class="client-comodato"
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando...</div>}
    </>
  );
};

export default ClientComodatoForm;