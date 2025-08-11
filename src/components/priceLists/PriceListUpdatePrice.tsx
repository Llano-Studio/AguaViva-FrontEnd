import React, { useState } from "react";
import { ModalUpdate } from "../common/ModalUpdate";
import { priceListUpdatePriceConfig } from "../../config/priceLists/priceListUpdatePriceConfig";
import { usePriceLists } from "../../hooks/usePriceLists";
import { usePriceListItems } from "../../hooks/usePriceListItem";
import Tab, { TabOption } from "../common/Tab";

interface PriceListUpdatePriceProps {
  isOpen: boolean;
  onClose: () => void;
  priceListId: number;
  classForm?: string;
  onUpdated?: () => void;
}

const signTabs: TabOption[] = [
  { key: "sumar", label: "Sumar" },
  { key: "restar", label: "Restar" },
];

export const PriceListUpdatePrice: React.FC<PriceListUpdatePriceProps> = ({
  isOpen,
  onClose,
  priceListId,
  classForm,
  onUpdated,
}) => {
  const { applyPercentage, fetchPriceListById } = usePriceLists();
  const { fetchItems } = usePriceListItems(priceListId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"sumar" | "restar">("sumar");

  const initialValues = { percentage: 0, reason: "" };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const percentage = mode === "sumar" ? Math.abs(values.percentage) : -Math.abs(values.percentage);
      const payload = {
        percentage,
        reason: values.reason,
      };
      const result = await applyPercentage(priceListId, payload);
      await fetchPriceListById(priceListId);
      await fetchItems();
      if (result && onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar precios");
    } finally {
      setLoading(false);
    }
  };

  // Tab para sumar/restar
  const renderTab = (
    <Tab
      options={signTabs}
      activeKey={mode}
      onChange={key => setMode(key as "sumar" | "restar")}
      style={{ marginBottom: 16 }}
    />
  );

  return (
    <ModalUpdate
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Modificar precios de la lista"
      config={priceListUpdatePriceConfig}
      class={classForm}
      loading={loading}
      error={error}
      initialValues={initialValues}
      renderExtra={renderTab}
    />
  );
};