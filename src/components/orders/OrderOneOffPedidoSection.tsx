import React from "react";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderOneOffPedidoFields } from "../../config/orders/orderFieldsConfig";

interface OrderOneOffPedidoSectionProps {
  form: any;
}

export const OrderOneOffPedidoSection: React.FC<OrderOneOffPedidoSectionProps> = ({ form }) => {
  return (
    <fieldset className="order-section">
      <legend>Datos del pedido</legend>
      <ItemFormOrder
        {...form}
        fields={orderOneOffPedidoFields}
        hideActions
        onSubmit={() => {}}
      />
    </fieldset>
  );
};