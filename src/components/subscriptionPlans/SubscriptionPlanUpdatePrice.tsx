import React, { useState } from "react";
import { ModalUpdate } from "../common/ModalUpdate";
import { subscriptionPlanUpdatePriceConfig } from "../../config/subscriptionPlans/subscriptionPlanUpdatePriceConfig";
import Switch from "../common/Switch";
import { SubscriptionPlanService } from "../../services/SubscriptionPlanService";

interface SubscriptionPlanUpdatePriceProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  classForm?: string;
}

const planService = new SubscriptionPlanService();

export const SubscriptionPlanUpdatePrice: React.FC<SubscriptionPlanUpdatePriceProps> = ({
  isOpen,
  onClose,
  onUpdated,
  classForm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switches
  const [mode, setMode] = useState<"porcentaje" | "monto">("porcentaje");
  const [sign, setSign] = useState<"sumar" | "restar">("sumar");

  const initialValues = { percentage: 0, fixedAmount: 0, reason: "" };

    const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
        let payload: any = { reason: values.reason };
        if (mode === "porcentaje") {
        payload.percentage = sign === "sumar" ? Math.abs(values.percentage) : -Math.abs(values.percentage);
        // No incluyas fixedAmount
        } else {
        payload.fixedAmount = sign === "sumar" ? Math.abs(values.fixedAmount) : -Math.abs(values.fixedAmount);
        // No incluyas percentage
        }
        await planService.adjustAllPrices(payload);
        if (onUpdated) onUpdated();
        onClose();
    } catch (err: any) {
        setError(err.message || "Error al actualizar precios");
    } finally {
        setLoading(false);
    }
    };

  // Renderiza los switches arriba del form
  const renderExtra = (
    <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
      <Switch
        value={mode}
        onChange={setMode}
        options={["porcentaje", "monto"]}
        labels={["Porcentaje", "Monto fijo"]}
      />
      <Switch
        value={sign}
        onChange={setSign}
        options={["sumar", "restar"]}
        labels={["Sumar", "Restar"]}
      />
    </div>
  );

  // Oculta el input que no corresponde según el modo
  const filteredConfig = subscriptionPlanUpdatePriceConfig.filter(field =>
    mode === "porcentaje"
      ? field.accessor !== "fixedAmount"
      : field.accessor !== "percentage"
  );

  return (
    <ModalUpdate
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Modificar precios de los abonos"
      config={filteredConfig}
      class={classForm}
      loading={loading}
      error={error}
      initialValues={initialValues}
      renderExtra={renderExtra}
    />
  );
};

export default SubscriptionPlanUpdatePrice;