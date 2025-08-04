import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { CreateOrderOneOffDTO, CreateOrderOneOffFormDTO, OrderOneOff } from "../../interfaces/OrderOneOff";
import { orderOneOffNotesFields } from "../../config/orders/orderFieldsConfig";
import { useSnackbar } from "../../context/SnackbarContext";
import useOrdersOneOff from "../../hooks/useOrdersOneOff";
import { OrderOneOffClientSection } from "./OrderOneOffClientSection";
import { OrderOneOffPedidoSection } from "./OrderOneOffPedidoSection";
import { OrderOneOffArticlesSection } from "./OrderOneOffArticlesSection";
import { ItemFormOrder } from "../common/ItemFormOrder";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";

interface OrderOneOffFormProps {
  onSubmit?: (orderData: CreateOrderOneOffDTO) => Promise<boolean>;
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
): CreateOrderOneOffFormDTO => {
  if (isEditing && orderToEdit) {
    return {
      person_id: orderToEdit.person_id,
      sale_channel_id: orderToEdit.sale_channel_id,
      delivery_address: orderToEdit.delivery_address,
      notes: orderToEdit.notes ?? "",
      paid_amount: orderToEdit.paid_amount,
      items: orderToEdit.purchase_items?.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_list_id: item.price_list_id,
        notes: item.notes,
      })) ?? [],
      customer_id_display: orderToEdit.person?.person_id,
      zone_name: "",
      zone_id: "",
      mobile: [],
      delivery_time_start: "",
      delivery_time_end: "",
      order_type: "ONE_OFF",
      status: "PENDING",
    };
  }
  return {
    person_id: 0,
    sale_channel_id: 1,
    delivery_address: "",
    notes: "",
    paid_amount: "",
    items: [],
    customer_id_display: undefined,
    zone_name: "",
    zone_id: "",
    mobile: [],
    delivery_time_start: "",
    delivery_time_end: "",
    order_type: "ONE_OFF",
    status: "PENDING",
  };
};

const OrderOneOffForm: React.FC<OrderOneOffFormProps> = ({
  onCancel,
  isEditing = false,
  orderToEdit,
  refreshOrders,
  class: classForm,
  onSuccess,
}) => {
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateOrderOneOffDTO | null>(null);

  const { createOrder } = useOrdersOneOff();
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, orderToEdit),
    [isEditing, orderToEdit]
  );

  const form = useForm<CreateOrderOneOffFormDTO>({
    defaultValues: initialValues,
  });

  // Artículos agregados
  const [articles, setArticles] = useState<any[]>(initialValues.items ?? []);

  // Handler para submit
  const handleSubmit = async (values: CreateOrderOneOffFormDTO | FormData) => {
    const items = articles.map(a => ({
      product_id: a.product_id,
      quantity: Number(a.quantity),
      price_list_id: a.price_list_id,
      notes: a.notes
    }));

    const data: CreateOrderOneOffDTO = {
      person_id: selectedClient?.person_id ?? form.getValues("person_id"),
      sale_channel_id: form.getValues("sale_channel_id"),
      delivery_address: form.getValues("delivery_address"),
      notes: form.getValues("notes"),
      paid_amount: form.getValues("paid_amount"),
      items,
    };

    if (isEditing && orderToEdit) {
      setPendingValues(data);
      setShowUpdateConfirm(true);
      return;
    }
    try {
      await createOrder(data);
      if (refreshOrders) await refreshOrders();
      if (onSuccess) onSuccess("Pedido One-Off creado correctamente.");
      showSnackbar("Pedido One-Off creado correctamente.", "success");
      onCancel();
    } catch (err: any) {
      setError(err?.message || "Error al guardar el pedido One-Off");
      showSnackbar(err?.message || "Error al guardar el pedido One-Off", "error");
      console.error(err);
    }
  };

  const handleConfirmUpdate = async () => {
    setShowUpdateConfirm(false);
    setPendingValues(null);
    // Implementa updateOrderOneOff aquí si lo necesitas
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={classForm}>
        {/* Datos del cliente */}
        <OrderOneOffClientSection
          form={form}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />

        {/* Datos del pedido */}
        <OrderOneOffPedidoSection
          form={form}
        />

        {/* Sección Datos de artículos */}
        <OrderOneOffArticlesSection
          form={form}
          setArticles={setArticles}
          articles={articles}
        />

        <ItemFormOrder
          {...form}
          fields={orderOneOffNotesFields}
          hideActions={true}
          onSubmit={() => {}}
          class="notes-order"
        />

        {error && <div className="error-message">{error}</div>}

        <div className="order-actions">
          <button type="submit" className="order-actions-button-submit">Agregar pedido One-Off</button>
          <button type="button" onClick={onCancel} className="order-actions-button-cancel">Cancelar</button>
        </div>

        <ModalUpdateConfirm
          isOpen={showUpdateConfirm}
          onClose={() => setShowUpdateConfirm(false)}
          onConfirm={handleConfirmUpdate}
          content="pedido"
          genere="M"
        />
      </form>
    </>
  );
};

export default OrderOneOffForm;