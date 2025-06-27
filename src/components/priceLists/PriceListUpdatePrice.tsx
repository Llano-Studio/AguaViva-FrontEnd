import React, { useState } from "react";
import { ModalUpdate } from "../common/ModalUpdate";
import { priceListUpdatePriceConfig } from "../../config/priceLists/priceListUpdatePriceConfig";
import { usePriceLists } from "../../hooks/usePriceLists";
import Switch from "../common/Switch";
import { usePriceListItems } from "../../hooks/usePriceListItem";

interface PriceListUpdatePriceProps {
  isOpen: boolean;
  onClose: () => void;
  priceListId: number;
  classForm?: string;
  onUpdated?: () => void;
}

export const PriceListUpdatePrice: React.FC<PriceListUpdatePriceProps> = ({
  isOpen,
  onClose,
  priceListId,
  classForm,
  onUpdated,
}) => {
  const { applyPercentage, fetchPriceListById } = usePriceLists();
  const { fetchItems } = usePriceListItems(priceListId); // Si necesitas refrescar los items locales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"sumar" | "restar">("sumar");

  // Valores iniciales del modal
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
      // Refresca los productos de la lista de precios
      await fetchPriceListById(priceListId);
      await fetchItems(); // Si usas un hook local para los items
      if (result && onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar precios");
    } finally {
      setLoading(false);
    }
  };

  // Switch para sumar/restar
  const renderSwitch = (
    <Switch
      value={mode}
      onChange={setMode}
      options={["sumar", "restar"]}
      labels={["Sumar", "Restar"]}
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
      // Renderiza el switch arriba del form
      renderExtra={renderSwitch}
    />
  );
};