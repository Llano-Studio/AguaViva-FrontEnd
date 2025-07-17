import React from "react";
import { useForm } from "react-hook-form";
import { clientSubscriptionFields } from "../../config/clients/clientSubscriptionFieldsConfig";
import { Field, ItemForm } from "../common/ItemForm";
import { formatTimeRangeFields } from "../../utils/formatTimeRangeFields"; 

interface ClientSubscriptionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
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
  // Inyectar dinámicamente las opciones de planes
  const fields: Field<any>[] = clientSubscriptionFields.map(field =>
    field.name === "subscription_plan_id"
      ? { ...field, options: plansOptions }
      : field
  );

  // Usar useForm y pasar el resultado a ItemForm
  const form = useForm({
    defaultValues: initialValues
  });

  // Handler para armar los rangos de horario antes de enviar a la API
  const handleSubmit = (values: any) => {
    // Usar la función utilitaria genérica
    const dataToSend = { ...values };
    if (dataToSend.delivery_preferences) {
      dataToSend.delivery_preferences = formatTimeRangeFields(
        dataToSend.delivery_preferences,
        [
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
        ]
      );
    }
    onSubmit(dataToSend);
  };

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