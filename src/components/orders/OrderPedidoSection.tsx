import React from "react";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderPedidoFields } from "../../config/orders/orderFieldsConfig";
import { useFormOrder } from "../../hooks/useFormOrder";

export const OrderPedidoSection = ({
  form,
}: any) => {
  const { zoneMobiles } = useFormOrder();

  return (
    <fieldset className="order-section">
      <legend>Datos del pedido</legend>
      <ItemFormOrder
        {...form}
        fields={orderPedidoFields}
        hideActions
        onSubmit={() => {}}
        selectFieldProps={{
          mobile: {
            options: zoneMobiles.map((mobile: any) => ({
              label: mobile.name || mobile.plate,
              value: String(mobile.id)
            })),
            value: form.watch("mobile") || "",
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
              form.setValue("mobile", e.target.value);
            }
          }
        }}
      />
    </fieldset>
  );
};