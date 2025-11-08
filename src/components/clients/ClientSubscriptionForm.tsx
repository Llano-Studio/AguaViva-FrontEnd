import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { clientSubscriptionFields } from "../../config/clients/clientSubscriptionFieldsConfig";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { formatTimeRangeFields } from "../../utils/formatTimeRangeFields";
import { useSnackbar } from "../../context/SnackbarContext";
import { CreateClientSubscriptionDTO } from "../../interfaces/ClientSubscription";
import { getDefaultCollectionDay } from "../../utils/getDefaultCollectionDay";
import SpinnerLoading from "../common/SpinnerLoading";

interface ClientSubscriptionFormProps {
  initialValues?: Partial<CreateClientSubscriptionDTO> & any;
  onSubmit: (values: CreateClientSubscriptionDTO | any) => Promise<any> | any;
  onCancel: () => void;
  plansOptions: { label: string; value: number }[];
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
  onPlanChange?: (planId: number | "" | null) => void; // avisa al padre el plan seleccionado
}

const ClientSubscriptionForm: React.FC<ClientSubscriptionFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  plansOptions,
  loading,
  error,
  isEditing,
  onPlanChange,
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
    const startDate = today.toISOString().split("T")[0];
    return {
      ...initialValues,
      start_date: startDate,
      collection_day: getDefaultCollectionDay(), // default según hoy (si >28 => 1)
      payment_mode: "ADVANCE",
      status: "ACTIVE",
    };
  };

  // Inyectar dinámicamente las opciones de planes
  const fields: Field<any>[] = clientSubscriptionFields.map((field) =>
    field.name === "subscription_plan_id" ? { ...field, options: plansOptions } : field
  );

  // useForm y paso a ItemForm
  const form = useForm<CreateClientSubscriptionDTO>({
    defaultValues: getDefaultDates() as any,
  });

  const { getValues } = form;

  // Armar payload antes de enviar
  const handleSubmit = async (values: CreateClientSubscriptionDTO | any) => {
    const dataToSend = { ...values };
    if (!dataToSend.payment_mode) dataToSend.payment_mode = "ADVANCE";
    if (!dataToSend.status) dataToSend.status = "ACTIVE"; // fuerza ACTIVE si no viene
    if (dataToSend.delivery_preferences) {
      dataToSend.delivery_preferences = formatTimeRangeFields(dataToSend.delivery_preferences, [
        { start: "preferred_time_range_start", end: "preferred_time_range_end", target: "preferred_time_range", asArray: false },
        { start: "avoid_times_start", end: "avoid_times_end", target: "avoid_times", asArray: true },
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

  // Notificar al padre el valor inicial del plan (si existiera)
  useEffect(() => {
    if (!onPlanChange) return;
    const initVal: any = getValues("subscription_plan_id");
    if (initVal === undefined) return;
    onPlanChange(initVal === "" || initVal === null ? initVal : Number(initVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onFieldChange={(fieldName, value) => {
          if (fieldName === "subscription_plan_id") {
            onPlanChange?.(value === "" || value === null ? value : Number(value));
          }
        }}
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="p-4 container-loading"><SpinnerLoading/></div>}
    </>
  );
};

export default ClientSubscriptionForm;