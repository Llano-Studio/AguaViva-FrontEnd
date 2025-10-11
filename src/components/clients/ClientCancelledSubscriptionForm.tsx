import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { clientCancelledSubscriptionFields } from "../../config/clients/clientCancelledSubscriptionFieldsConfig";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";
import { useSnackbar } from "../../context/SnackbarContext";
import SpinnerLoading from "../common/SpinnerLoading";

interface ClientCancelledSubscriptionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<any> | any;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const ClientCancelledSubscriptionForm: React.FC<ClientCancelledSubscriptionFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading,
  error,
}) => {
  const { showSnackbar } = useSnackbar();

  // Defaults (fecha hoy)
  const defaults = {
    scheduled_collection_date:
      new Date().toISOString().slice(0, 10),
    notes: "",
  };

  const fields: Field<any>[] = clientCancelledSubscriptionFields;

  const form = useForm({
    defaultValues: defaults,
  });

  const handleSubmit = async (values: any) => {
    try {
      await Promise.resolve(onSubmit(values));
    } catch (e: any) {
      showSnackbar(e?.message || "Error al preparar cancelación", "error");
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
        class="client-cancelled-subscription"
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="p-4 container-loading"><SpinnerLoading/></div>}
    </>
  );
};

export default ClientCancelledSubscriptionForm;