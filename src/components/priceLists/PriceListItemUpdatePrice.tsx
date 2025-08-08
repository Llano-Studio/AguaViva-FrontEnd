import React, { useState } from "react";
import { ModalUpdate } from "../common/ModalUpdate";
import { usePriceListItems } from "../../hooks/usePriceListItem";

interface PriceListItemUpdatePriceProps {
  isOpen: boolean;
  onClose: () => void;
  item: any; // El ítem que se va a editar
  classForm?: string;
  onUpdated?: () => void;
}

export const PriceListItemUpdatePrice: React.FC<PriceListItemUpdatePriceProps> = ({
  isOpen,
  onClose,
  item,
  classForm,
  onUpdated,
}) => {
  if (!item) {
    return null; 
  }

  const { updateItem } = usePriceListItems(item.price_list_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = { unit_price: item.unit_price };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        unit_price: values.unit_price,
      };
      const result = await updateItem(item.price_list_item_id, payload);
      if (result && onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el precio del ítem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalUpdate
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Actualizar precio del artículo"
      config={[
        {
          label: "Precio Unitario",
          accessor: "unit_price",
          type: "number",
          required: true,
          min: 0,
        },
      ]}
      class={classForm}
      loading={loading}
      error={error}
      initialValues={initialValues}
    />
  );
};