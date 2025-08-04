import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateOrderDTO, OrderItemInput, OrderItemInputForm,  CreateOrderFormDTO } from "../../interfaces/Order";
import { ListItem } from "../common/ListItem";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { useFormOrder } from "../../hooks/useFormOrder";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderNotesFields } from "../../config/orders/orderFieldsConfig";
import { OrderClientSection } from "./OrderClientSection";
import { OrderPedidoSection } from "./OrderPedidoSection";
import { OrderArticlesSection } from "./OrderArticlesSection";
import { calculatePriceTotalOrder } from "../../utils/calculatePriceTotalOrder";
import useOrders from "../../hooks/useOrders";
import "../../styles/css/components/orders/orderForm.css";

interface OrderFormProps {
  onSubmit: (orderData: CreateOrderDTO) => Promise<boolean>;
  onCancel: () => void;
  isEditing?: boolean;
  orderToEdit?: any;
  refreshOrders?: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

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

  // Cliente seleccionado
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Formulario articulos
  const [selectedAbonoName, setSelectedAbonoName] = useState<string>("-");
  const [abonoSelected, setAbonoSelected] = useState<null | number>(null); 
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedPriceListName, setSelectedPriceListName] = useState<string>("");

  const { fetchDeliveryPreferences } = useOrders();
  const [deliveryPreferences, setDeliveryPreferences] = useState<any>(null);

  // Hook de lógica
  const {
    fetchClientDetails,
    fetchZoneMobiles,
  } = useFormOrder();

  // Artículos agregados
  const [articles, setArticles] = useState<OrderItemInputForm[]>(orderToEdit?.order_item?.map((oi: any) => ({
    product_id: oi.product_id,
    product_name: oi.product_name || "",
    quantity: oi.quantity,
    price_list_id: oi.price_list_id,
    price_list_name: oi.price_list_name,
    notes: oi.notes,
    abono_id: oi.abono_id || "",
    abono_name: oi.abono_name || "",
    price_unit: oi.price_unit || "0",
    price_total_item: oi.price_total_item || "0",
    image_url: oi.image_url || "",
    is_returnable: oi.is_returnable || false,
  })) ?? []);

  const form = useForm<CreateOrderFormDTO>({
    defaultValues: {
      customer_id: orderToEdit?.customer_id ?? 0,
      contract_id: orderToEdit?.contract_id,
      subscription_id: orderToEdit?.subscription_id,
      sale_channel_id: orderToEdit?.sale_channel_id ?? 1,
      order_date: orderToEdit?.order_date ?? new Date().toISOString().slice(0, 10),
      scheduled_delivery_date: orderToEdit?.scheduled_delivery_date ?? new Date().toISOString().slice(0, 10),
      delivery_time: orderToEdit?.delivery_time ?? "",
      delivery_time_start: orderToEdit?.delivery_time?.split("-")[0] ?? "",
      delivery_time_end: orderToEdit?.delivery_time?.split("-")[1] ?? "",
      total_amount: orderToEdit?.total_amount ?? "0",
      paid_amount: orderToEdit?.paid_amount ?? "0",
      order_type: orderToEdit?.order_type ?? "HYBRID",
      status: orderToEdit?.status ?? "PENDING",
      notes: orderToEdit?.notes ?? "",
      items: [],
      customer_address: "",
      customer_id_display: undefined,
      zone_name: "",
      zone_id: "",
      mobile: [],
    }
  });

  useEffect(() => {
    const total = calculatePriceTotalOrder(articles);
    form.setValue("total_amount", total);
  }, [articles]);

  // Handler para submit
  const handleSubmit = async (values: CreateOrderDTO | FormData) => {
    const v = values as any;
    const delivery_time = `${v.delivery_time_start}-${v.delivery_time_end}`;

    // Filtrar solo los campos necesarios para cada item
    const items = articles.map(a => ({
      product_id: a.product_id,
      quantity: Number(a.quantity),
      price_list_id: a.price_list_id,
      notes: a.notes
    }));

    const data: CreateOrderDTO = {
      customer_id: selectedClient?.id ?? form.getValues("customer_id"),
      contract_id: v.contract_id,
      subscription_id: v.subscription_id,
      sale_channel_id: v.sale_channel_id,
      order_date: v.order_date,
      scheduled_delivery_date: v.scheduled_delivery_date,
      delivery_time,
      total_amount: v.total_amount,
      paid_amount: v.paid_amount,
      order_type: v.order_type,
      status: v.status,
      notes: v.notes,
      items, // Solo los campos requeridos
    };

    if (isEditing && orderToEdit) {
      setPendingValues(data);
      setShowUpdateConfirm(true);
      return;
    }
  try {
    const result = await onSubmit(data);
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

  // Handler para confirmar edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !orderToEdit) return;
    try {
      // Aquí deberías llamar a tu función updateOrder si la tienes
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el pedido");
      showSnackbar(err?.message || "Error al actualizar el pedido", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  const handleSubscriptionChange = async (subscription_id: number) => {
    if (!selectedClient?.person_id) return;
    const prefs = await fetchDeliveryPreferences(selectedClient.person_id, subscription_id);
    setDeliveryPreferences(prefs); // Guardar las preferencias
    if (prefs?.preferred_time_range) {
      const [start, end] = prefs.preferred_time_range.split("-");
      form.setValue("delivery_time_start", start, { shouldDirty: true, shouldTouch: true });
      form.setValue("delivery_time_end", end, { shouldDirty: true, shouldTouch: true });
    }
  };

  console.log("OrderForm selectedClient:", selectedClient);
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={classForm}>
      {/* Datos del cliente */}
      <OrderClientSection
        form={form}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />

      {/* Datos del pedido */}
      <OrderPedidoSection
        key={JSON.stringify(deliveryPreferences) || "pedido"}
        form={form}
        deliveryPreferences={deliveryPreferences}
      />

      {/* Sección Datos de artículos */}
      <OrderArticlesSection
        form={form}
        setArticles={setArticles}
        articles={articles}
        abonoSelected={abonoSelected}
        selectedAbonoName={selectedAbonoName}
        selectedClient={selectedClient}
        setSelectedAbonoName={setSelectedAbonoName}
        setAbonoSelected={setAbonoSelected}
        selectedProductName={selectedProductName}
        setSelectedProductName={setSelectedProductName}
        selectedPriceListName={selectedPriceListName}
        setSelectedPriceListName={setSelectedPriceListName}
        handleSubscriptionChange={handleSubscriptionChange} // <-- NUEVO
      />

      <ItemFormOrder
        {...form}
        fields={orderNotesFields}
        hideActions={true}
        onSubmit={() => {}}
        class="notes-order"
      />
      
      {error && <div className="error-message">{error}</div>}

      <div className="order-actions">
        <button type="submit" className="order-actions-button-submit">Agregar pedido</button>
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
  );
};

export default OrderForm;