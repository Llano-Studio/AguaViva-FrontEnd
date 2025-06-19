import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CreateSubscriptionPlanDTO, SubscriptionPlan } from "../../interfaces/SubscriptionPlan";
import { ItemForm } from "../common/ItemForm";
import { subscriptionPlanFields } from "../../config/subscriptionPlans/subscriptionPlanFieldsConfig";
import useSubscriptionPlans from "../../hooks/useSubscriptionPlans";

interface SubscriptionPlanFormProps {
  onCancel: () => void;
  isEditing: boolean;
  planToEdit?: SubscriptionPlan | null;
  refreshPlans: () => Promise<void>;
  class?: string;
}

const getInitialValues = (
  isEditing: boolean,
  planToEdit?: SubscriptionPlan | null
): CreateSubscriptionPlanDTO => {
  if (isEditing && planToEdit) {
    return {
      name: planToEdit.name,
      description: planToEdit.description,
      price: planToEdit.price,
      cycle_days: planToEdit.cycle_days,
      deliveries_per_cycle: planToEdit.deliveries_per_cycle,
      active: planToEdit.active,
    };
  }
  return {
    name: "",
    description: "",
    price: 0,
    cycle_days: 30,
    deliveries_per_cycle: 1,
    active: true,
  };
};

const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({
  onCancel,
  isEditing,
  planToEdit,
  refreshPlans,
  class: classForm,
}) => {
  const { createSubscriptionPlan, updateSubscriptionPlan } = useSubscriptionPlans();
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, planToEdit),
    [isEditing, planToEdit]
  );

  const form = useForm<CreateSubscriptionPlanDTO>({
    defaultValues: initialValues,
  });

    const handleSubmit = async (values: CreateSubscriptionPlanDTO | FormData) => {
    try {
        let success = false;
        if (values instanceof FormData) {
        // No deberías recibir FormData aquí, pero por compatibilidad:
        setError("No se admiten archivos en este formulario.");
        return;
        }
        if (isEditing && planToEdit) {
        success = await updateSubscriptionPlan(planToEdit.subscription_plan_id, values);
        } else {
        success = await createSubscriptionPlan(values);
        }
        if (success) {
        await refreshPlans();
        onCancel();
        } else {
        setError("Error al guardar el abono");
        }
    } catch (err) {
        setError("Error al guardar el abono");
        console.error(err);
    }
    };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <ItemForm<CreateSubscriptionPlanDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={subscriptionPlanFields}
        class={classForm}
      />
    </>
  );
};

export default SubscriptionPlanForm;