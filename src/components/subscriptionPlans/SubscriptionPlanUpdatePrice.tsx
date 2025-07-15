import React, { useState } from "react";
import { ModalUpdate } from "../common/ModalUpdate";
import { subscriptionPlanUpdatePriceConfig } from "../../config/subscriptionPlans/subscriptionPlanUpdatePriceConfig";
import { SubscriptionPlanService } from "../../services/SubscriptionPlanService";
import Tab, { TabOption } from "../common/Tab";

interface SubscriptionPlanUpdatePriceProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  classForm?: string;
}

const planService = new SubscriptionPlanService();

const tabs: TabOption[] = [
  { key: "porcentaje", label: "Porcentaje" },
  { key: "monto", label: "Monto fijo" },
];

const signTabs: TabOption[] = [
  { key: "sumar", label: "Sumar" },
  { key: "restar", label: "Restar" },
];

export const SubscriptionPlanUpdatePrice: React.FC<SubscriptionPlanUpdatePriceProps> = ({
  isOpen,
  onClose,
  onUpdated,
  classForm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"porcentaje" | "monto">("porcentaje");
  const [sign, setSign] = useState<"sumar" | "restar">("sumar");

  const initialValues = { percentage: 0, fixedAmount: 0, reason: "" };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      let payload: any = { reason: values.reason };
      if (activeTab === "porcentaje") {
        payload.percentage = sign === "sumar" ? Math.abs(values.percentage) : -Math.abs(values.percentage);
      } else {
        payload.fixedAmount = sign === "sumar" ? Math.abs(values.fixedAmount) : -Math.abs(values.fixedAmount);
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

  const renderExtra = (
    <div style={{ display: "flex", gap: 24, marginBottom: 16, flexDirection: "column" }}>
      <Tab
        options={tabs}
        activeKey={activeTab}
        onChange={key => setActiveTab(key as "porcentaje" | "monto")}
      />
      <Tab
        options={signTabs}
        activeKey={sign}
        onChange={key => setSign(key as "sumar" | "restar")}
        style={{ marginTop: 8 }}
      />
    </div>
  );

  const filteredConfig = subscriptionPlanUpdatePriceConfig.filter(field =>
    activeTab === "porcentaje"
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