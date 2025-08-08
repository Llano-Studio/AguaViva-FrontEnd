import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { CreateOrderOneOffDTO, CreateOrderOneOffFormDTO, OrderOneOff } from "../../interfaces/OrderOneOff";
import { useSnackbar } from "../../context/SnackbarContext";
import useOrdersOneOff from "../../hooks/useOrdersOneOff";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { OrderOneOffClientSection } from "./OrderOneOffClientSection";
import { OrderOneOffPedidoSection } from "./OrderOneOffPedidoSection";
import { OrderOneOffArticlesSection } from "./OrderOneOffArticlesSection";

interface OrderOneOffFormProps {
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
      customer: {
        name: orderToEdit.person?.name || "",
        phone: "",
        alias: "",
        address: "",
        taxId: "",
        localityId: orderToEdit.locality?.locality_id || 0,
        zoneId: orderToEdit.zone?.zone_id || 0,
        type: "INDIVIDUAL",
      },
      items: [
        {
          product_id: orderToEdit.product.product_id,
          quantity: orderToEdit.quantity || 1,
        },
      ],
      sale_channel_id: orderToEdit.sale_channel.sale_channel_id,
      requires_delivery: true,
      price_list_id: 1,
      delivery_address: "",
      locality_id: orderToEdit.locality.locality_id,
      zone_id: orderToEdit.zone.zone_id,
      purchase_date: orderToEdit.purchase_date,
      scheduled_delivery_date: orderToEdit.scheduled_delivery_date,
      delivery_time: orderToEdit.delivery_time,
      order_type: "ONE_OFF",
      status: "PENDING",
    };
  }
  return {
    customer: {
      name: "",
      phone: "",
      alias: "",
      address: "",
      taxId: "",
      localityId: 0,
      zoneId: 0,
      type: "INDIVIDUAL",
    },
    items: [],
    sale_channel_id: 1,
    requires_delivery: true,
    price_list_id: 1,
    delivery_address: "",
    locality_id: 0,
    zone_id: 0,
    purchase_date: "",
    scheduled_delivery_date: "",
    delivery_time: "",
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

  const { createOrder, updateOrder } = useOrdersOneOff();
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, orderToEdit),
    [isEditing, orderToEdit]
  );

  const form = useForm<CreateOrderOneOffFormDTO>({
    defaultValues: initialValues,
  });

  const [articles, setArticles] = useState<any[]>(initialValues.items ?? []);

  const handleSubmit = async (values: CreateOrderOneOffFormDTO) => {
    const items = articles.map(a => ({
      product_id: a.product_id,
      quantity: Number(a.quantity),
    }));

    const data: CreateOrderOneOffDTO = {
      customer: {
        name: selectedClient?.name || form.getValues("customer.name"),
        phone: selectedClient?.phone || form.getValues("customer.phone"),
        alias: form.getValues("customer.alias"),
        address: form.getValues("customer.address"),
        taxId: form.getValues("customer.taxId"),
        localityId: form.getValues("customer.localityId"),
        zoneId: form.getValues("customer.zoneId"),
        type: form.getValues("customer.type"),
      },
      items,
      sale_channel_id: form.getValues("sale_channel_id"),
      requires_delivery: form.getValues("requires_delivery"),
      price_list_id: form.getValues("price_list_id"),
      delivery_address: form.getValues("delivery_address"),
      locality_id: form.getValues("locality_id"),
      zone_id: form.getValues("zone_id"),
      purchase_date: form.getValues("purchase_date"),
      scheduled_delivery_date: form.getValues("scheduled_delivery_date"),
      delivery_time: form.getValues("delivery_time"),
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
    if (!pendingValues || !orderToEdit) return;
    try {
      await updateOrder(orderToEdit.purchase_id, pendingValues);
      if (refreshOrders) await refreshOrders();
      if (onSuccess) onSuccess("Pedido One-Off actualizado correctamente.");
      showSnackbar("Pedido One-Off actualizado correctamente.", "success");
      onCancel();
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el pedido One-Off");
      showSnackbar(err?.message || "Error al actualizar el pedido One-Off", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={classForm}>
        <OrderOneOffClientSection
          form={form}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />

        <OrderOneOffPedidoSection form={form} />

        <OrderOneOffArticlesSection
          form={form}
          setArticles={setArticles}
          articles={articles}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="order-actions">
          <button type="submit" className="order-actions-button-submit">
            {isEditing ? "Actualizar pedido" : "Agregar pedido"}
          </button>
          <button type="button" onClick={onCancel} className="order-actions-button-cancel">
            Cancelar
          </button>
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