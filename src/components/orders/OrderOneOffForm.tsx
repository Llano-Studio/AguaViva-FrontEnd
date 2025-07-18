import React, { useState, useMemo } from "react";
import { CreateOrderOneOffDTO, OrderOneOff } from "../../interfaces/OrderOneOff";
import { ItemForm } from "../common/ItemForm";
import { orderOneOffFormFields } from "../../config/orders/orderFieldsConfig";
import { useForm } from "react-hook-form";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";

interface OrderOneOffFormProps {
  onSubmit: (orderData: CreateOrderOneOffDTO) => Promise<boolean>;
  onCancel: () => void;
  isEditing?: boolean;
  orderToEdit?: OrderOneOff | null;
  refreshOrders?: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (
  isEditing: boolean = false,
  orderToEdit?: OrderOneOff | null
): CreateOrderOneOffDTO => {
  if (isEditing && orderToEdit) {
    return {
      person_id: orderToEdit.person_id,
      sale_channel_id: orderToEdit.sale_channel_id,
      price_list_id: undefined, // No existe en OrderOneOff, lo dejamos undefined
      delivery_address: orderToEdit.person?.address ?? "",
      locality_id: orderToEdit.locality_id,
      zone_id: orderToEdit.zone_id,
      purchase_date: orderToEdit.purchase_date,
      notes: orderToEdit.notes ?? "",
      payment_method_id: orderToEdit.payment_method_id,
      items: [
        {
          product_id: orderToEdit.product_id,
          quantity: orderToEdit.quantity,
        },
      ],
    };
  }
  return {
    person_id: 0,
    sale_channel_id: 0,
    price_list_id: undefined,
    delivery_address: "",
    locality_id: 0,
    zone_id: 0,
    purchase_date: new Date().toISOString().split("T")[0],
    notes: "",
    payment_method_id: undefined,
    items: [],
  };
};

const OrderOneOffForm: React.FC<OrderOneOffFormProps> = ({
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
  const [pendingValues, setPendingValues] = useState<CreateOrderOneOffDTO | null>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, orderToEdit),
    [isEditing, orderToEdit]
  );

  const form = useForm<CreateOrderOneOffDTO>({
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: CreateOrderOneOffDTO | FormData) => {
    if (isEditing && orderToEdit) {
      setPendingValues(values as CreateOrderOneOffDTO);
      setShowUpdateConfirm(true);
      return;
    }
    try {
      const result = await onSubmit(values as CreateOrderOneOffDTO);
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
      // Aquí deberías llamar a tu función updateOrderOneOff si la tienes
      // const updatedOrder = await updateOrderOneOff(orderToEdit.purchase_id, pendingValues);
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
      <ItemForm<CreateOrderOneOffDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={orderOneOffFormFields()}
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

export default OrderOneOffForm;