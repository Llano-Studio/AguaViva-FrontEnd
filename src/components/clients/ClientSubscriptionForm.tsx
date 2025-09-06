import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { clientSubscriptionFields } from "../../config/clients/clientSubscriptionFieldsConfig";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { formatTimeRangeFields } from "../../utils/formatTimeRangeFields";
import { useSnackbar } from "../../context/SnackbarContext";

interface ClientSubscriptionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<any> | any;
  onCancel: () => void;
  plansOptions: { label: string; value: number }[];
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

const ClientSubscriptionForm: React.FC<ClientSubscriptionFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  plansOptions,
  loading,
  error,
  isEditing,
}) => {
  const { showSnackbar } = useSnackbar();

  // Detecta edición aunque isEditing no venga seteado
  const isEditingMode =
    typeof isEditing === "boolean"
      ? isEditing
      : Boolean(initialValues?.subscription_id ?? initialValues?.id);

  // Calcular fechas por defecto solo para nuevas suscripciones
  const getDefaultDates = () => {
    if (isEditingMode || Object.keys(initialValues).length > 0) {
      return initialValues;
    }
    const today = new Date();
    const startDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
    return {
      ...initialValues,
      start_date: startDate,
    };
  };

  // Inyectar dinámicamente las opciones de planes
  const fields: Field<any>[] = clientSubscriptionFields.map((field) =>
    field.name === "subscription_plan_id" ? { ...field, options: plansOptions } : field
  );

  // useForm y paso a ItemForm
  const form = useForm({
    defaultValues: getDefaultDates(),
  });

  // Armar payload antes de enviar
  const handleSubmit = async (values: any) => {
    const dataToSend = { ...values };
    if (dataToSend.delivery_preferences) {
      dataToSend.delivery_preferences = formatTimeRangeFields(dataToSend.delivery_preferences, [
        {
          start: "preferred_time_range_start",
          end: "preferred_time_range_end",
          target: "preferred_time_range",
          asArray: false,
        },
        {
          start: "avoid_times_start",
          end: "avoid_times_end",
          target: "avoid_times",
          asArray: true,
        },
      ]);
    }
    try {
      await Promise.resolve(onSubmit(dataToSend));
      showSnackbar(
        isEditingMode ? "Suscripción actualizada correctamente." : "Suscripción creada correctamente.",
        "success"
      );
    } catch (e: any) {
      showSnackbar(e?.message || "Error al guardar la suscripción", "error");
    }
  };

  // Mostrar errores externos
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
        class="client-subscription"
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando...</div>}
    </>
  );
};

export default ClientSubscriptionForm;