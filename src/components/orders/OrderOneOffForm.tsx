import React, { useState, useMemo } from "react";
import { CreateOrderOneOffDTO, OrderOneOff } from "../../interfaces/OrderOneOff";
import { useForm, useFieldArray } from "react-hook-form";
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
      delivery_address: orderToEdit.delivery_address,
      notes: orderToEdit.notes ?? "",
      paid_amount: orderToEdit.paid_amount,
      items: orderToEdit.items?.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_list_id: item.price_list_id,
        notes: item.notes,
      })) ?? [],
    };
  }
  return {
    person_id: 0,
    sale_channel_id: 0,
    delivery_address: "",
    notes: "",
    paid_amount: 0,
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className={classForm}>
        <div>
          <label>Persona ID</label>
          <input type="number" {...form.register("person_id", { required: true })} />
        </div>
        <div>
          <label>Canal de venta</label>
          <input type="number" {...form.register("sale_channel_id", { required: true })} />
        </div>
        <div>
          <label>Dirección de entrega</label>
          <input type="text" {...form.register("delivery_address", { required: true })} />
        </div>
        <div>
          <label>Notas</label>
          <input type="text" {...form.register("notes")} />
        </div>
        <div>
          <label>Monto pagado</label>
          <input type="number" step="0.01" {...form.register("paid_amount", { required: true })} />
        </div>
        <div>
          <label>Productos</label>
          {fields.map((field, idx) => (
            <div key={field.id} style={{ border: "1px solid #ccc", margin: 4, padding: 4 }}>
              <input
                type="number"
                placeholder="Producto ID"
                {...form.register(`items.${idx}.product_id`, { required: true })}
              />
              <input
                type="number"
                placeholder="Cantidad"
                {...form.register(`items.${idx}.quantity`, { required: true })}
              />
              <input
                type="number"
                placeholder="Lista de precio ID"
                {...form.register(`items.${idx}.price_list_id`)}
              />
              <input
                type="text"
                placeholder="Notas del item"
                {...form.register(`items.${idx}.notes`)}
              />
              <button type="button" onClick={() => remove(idx)}>Eliminar</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ product_id: 0, quantity: 1, price_list_id: undefined, notes: "" })}
          >
            Agregar producto
          </button>
        </div>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </form>
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