import React, { useState, useMemo } from "react";
import { CreateOrderDTO, Order } from "../../interfaces/Order";
import { ItemForm } from "../common/ItemForm";
import { orderFormFields } from "../../config/orders/orderFieldsConfig";
import { useForm } from "react-hook-form";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";

interface OrderFormProps {
  onSubmit: (orderData: CreateOrderDTO) => Promise<boolean>;
  onCancel: () => void;
  isEditing?: boolean;
  orderToEdit?: Order | null;
  refreshOrders?: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (isEditing: boolean = false, orderToEdit?: Order | null): CreateOrderDTO => {
  if (isEditing && orderToEdit) {
    return {
      customer_id: orderToEdit.customer_id,
      order_type: orderToEdit.order_type,
      subscription_id: orderToEdit.subscription_id,
      contract_id: orderToEdit.contract_id,
      sale_channel_id: orderToEdit.sale_channel_id,
      order_date: orderToEdit.order_date,
      scheduled_delivery_date: orderToEdit.scheduled_delivery_date,
      delivery_time: orderToEdit.delivery_time,
      total_amount: orderToEdit.total_amount?.toString() ?? "0",
      paid_amount: orderToEdit.paid_amount?.toString() ?? "0",
      status: orderToEdit.status,
      notes: orderToEdit.notes ?? "",
      items: orderToEdit.order_item
        ? orderToEdit.order_item.map((oi: any) => ({
            product_id: oi.product_id,
            quantity: oi.quantity,
          }))
        : [],
    };
  }
  return {
    customer_id: 0,
    order_type: "SUBSCRIPTION",
    subscription_id: undefined,
    contract_id: undefined,
    sale_channel_id: 0,
    order_date: new Date().toISOString().split('T')[0],
    scheduled_delivery_date: new Date().toISOString().split('T')[0],
    delivery_time: "",
    total_amount: "0",
    paid_amount: "0",
    status: "PENDING",
    notes: "",
    items: [],
  };
};

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  isEditing = false,
  orderToEdit,
  refreshOrders,
  class: classForm,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateOrderDTO | null>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, orderToEdit),
    [isEditing, orderToEdit]
  );

  const form = useForm<CreateOrderDTO>({
    defaultValues: initialValues
  });

  const handleSubmit = async (values: CreateOrderDTO | FormData) => {
    if (isEditing && orderToEdit) {
      setPendingValues(values as CreateOrderDTO);
      setShowUpdateConfirm(true);
      return;
    }
    try {
      const result = await onSubmit(values as CreateOrderDTO);
      if (result) {
        if (refreshOrders) await refreshOrders();
        if (onSuccess) onSuccess("Pedido creado correctamente.");
        showSnackbar("Pedido creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el pedido");
        showSnackbar("Error al guardar el pedido", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el pedido");
      showSnackbar(err?.message || "Error al guardar el pedido", "error");
      console.error(err);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingValues || !orderToEdit) return;
    try {
      // Aquí deberías llamar a tu función updateOrder si la tienes
      // const updatedOrder = await updateOrder(orderToEdit.order_id, pendingValues);
      // if (updatedOrder) {
      //   if (refreshOrders) await refreshOrders();
      //   if (onSuccess) onSuccess("Pedido editado correctamente.");
      //   showSnackbar("Pedido editado correctamente.", "success");
      //   onCancel();
      // } else {
      //   setError("Error al actualizar el pedido");
      //   showSnackbar("Error al actualizar el pedido", "error");
      // }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el pedido");
      showSnackbar(err?.message || "Error al actualizar el pedido", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<CreateOrderDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={orderFormFields()}
        class={classForm}
      />
      {error && <div className="error-message">{error}</div>}

      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="pedido"
        genere="M"
      />
    </>
  );
};

export default OrderForm;