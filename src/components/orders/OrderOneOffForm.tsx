import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CreateOrderOneOffDTO,
  CreateOrderOneOffFormDTO,
  OrderOneOff,
  OrderOneOffItemInputForm
} from "../../interfaces/OrderOneOff";
import { useSnackbar } from "../../context/SnackbarContext";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { OrderOneOffClientSection } from "./OrderOneOffClientSection";
import { OrderOneOffPedidoSection } from "./OrderOneOffPedidoSection";
import { OrderOneOffArticlesSection } from "./OrderOneOffArticlesSection";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderOneOffNotesFields } from "../../config/orders/orderFieldsConfig";
import { calculatePriceTotalOrder } from "../../utils/calculatePriceTotalOrder";
import { usePriceLists } from "../../hooks/usePriceLists";
import useProducts from "../../hooks/useProducts";


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
): CreateOrderOneOffFormDTO => {
  if (isEditing && orderToEdit) {
    return {
      customer: {
        name: orderToEdit.person?.name || "",
        phone: orderToEdit.person?.phone || "",
        alias: "",
        address: orderToEdit.person?.address || "",
        taxId: "",
        localityId: orderToEdit.locality?.locality_id || 0,
        zoneId: orderToEdit.zone?.zone_id || 0,
        type: "INDIVIDUAL",
      },
      items: orderToEdit.products.map((prod) => ({
        product_id: prod.product_id,
        quantity: prod.quantity,
        price_list_id: prod.price_list_id,
        
      })),
      sale_channel_id: orderToEdit.sale_channel.sale_channel_id,
      requires_delivery: orderToEdit.requires_delivery,
      delivery_address: "",
      locality_id: orderToEdit.locality.locality_id,
      zone_id: orderToEdit.zone.zone_id,
      zone_name: orderToEdit.zone.name,
      purchase_date: orderToEdit.purchase_date ? new Date(orderToEdit.purchase_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      scheduled_delivery_date: orderToEdit.scheduled_delivery_date ? new Date(orderToEdit.scheduled_delivery_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      delivery_time: orderToEdit.delivery_time,
      total_amount: orderToEdit.total_amount,
      paid_amount: orderToEdit.paid_amount,
      notes: orderToEdit.notes || "",
      order_type: "ONE_OFF",
      status: orderToEdit.status || "PENDING",
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
    delivery_address: "",
    locality_id: 0,
    zone_id: 0,
    zone_name: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    scheduled_delivery_date: new Date().toISOString().slice(0, 10),
    delivery_time: "",
    total_amount: "0",
    paid_amount: "0",
    notes: "",
    order_type: "ONE_OFF",
    status: "PENDING",
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
  const { showSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateOrderOneOffDTO | null>(null);

  // Cliente y artículos
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedPriceListName, setSelectedPriceListName] = useState<string>("");

  const [deliveryPreferences, setDeliveryPreferences] = useState<any>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, orderToEdit),
    [isEditing, orderToEdit]
  );

  const form = useForm<CreateOrderOneOffFormDTO>({
    defaultValues: initialValues,
  });

  const { fetchPriceListById } = usePriceLists();
  const { fetchProductById } = useProducts();

  const [articles, setArticles] = useState<OrderOneOffItemInputForm[]>(orderToEdit?.products?.map((oi: any) => ({
    product_id: oi.product_id,
    product_name: oi.description || "",
    quantity: oi.quantity,
    price_list_id: oi.price_list_id || 1,
    price_list_name: oi.price_list?.name || "",
    notes: oi.notes || "",
    price_unit: oi.unit_price || "0",
    price_total_item: oi.subtotal,
    image_url: oi.image_url || "",
    is_returnable: oi.is_returnable || false,
  })) ?? []);


  useEffect(() => {
    const loadPriceListNames = async () => {
      if (!isEditing || !orderToEdit || articles.length === 0) return;

      // Verificar si aún faltan nombres
      const needFetch = articles.some(a => a.price_list_id && !a.price_list_name);
      if (!needFetch) return;

      // Evitar llamadas duplicadas: agrupar por id
      const ids = Array.from(
        new Set(
          articles
            .filter(a => a.price_list_id && !a.price_list_name)
            .map(a => a.price_list_id)
        )
      );

      const idToName = new Map<number, string>();
      await Promise.all(
        ids.map(async id => {
          const pl = await fetchPriceListById(id);
            idToName.set(id, pl?.name || "");
        })
      );

      setArticles(prev =>
        prev.map(a =>
          a.price_list_id && !a.price_list_name
            ? { ...a, price_list_name: idToName.get(a.price_list_id) || "" }
            : a
        )
      );
    };
    loadPriceListNames();
  }, [isEditing, orderToEdit, articles, fetchPriceListById]);


  useEffect(() => {
    const loadImages = async () => {
      if (!isEditing || !orderToEdit) return;
      const missing = articles.filter(a => !a.image_url);
      if (missing.length === 0) return;

      const updates = await Promise.all(
        missing.map(async a => {
          const p = await fetchProductById(a.product_id);
          return { id: a.product_id, image_url: p?.image_url || "" };
        })
      );

      setArticles(prev =>
        prev.map(a => {
          const found = updates.find(u => u.id === a.product_id);
            return found ? { ...a, image_url: found.image_url } : a;
        })
      );
    };
    loadImages();
  }, [isEditing, orderToEdit, articles, fetchProductById]);


  // Calcular total del pedido
  useEffect(() => {
    const total = calculatePriceTotalOrder(articles);
    form.setValue("total_amount", total);
    form.setValue("paid_amount", total);
  }, [articles]);

  // Handler para submit
  const handleSubmit = async (values: CreateOrderOneOffFormDTO) => {
    const items = articles.map((a) => ({
      product_id: a.product_id,
      quantity: Number(a.quantity),
      price_list_id: a.price_list_id,
    }));

    const v = values as any;
    let delivery_time = `${v.delivery_time_start}-${v.delivery_time_end}`;
    let delivery_address = form.getValues("customer.address");
    let locality_id = form.getValues("locality_id");
    let zone_id = form.getValues("zone_id");
    let scheduled_delivery_date = form.getValues("scheduled_delivery_date");

    if (!form.getValues("requires_delivery")) {
      delivery_time = "";
      delivery_address = "";
      locality_id = 0;
      zone_id = 0;
      scheduled_delivery_date = "";
    }

    const data: CreateOrderOneOffDTO = {
      customer: {
        name: selectedClient?.name || form.getValues("customer.name"),
        phone: selectedClient?.phone || form.getValues("customer.phone"),
        alias: form.getValues("customer.alias") || "",
        address: form.getValues("customer.address"),
        taxId: form.getValues("customer.taxId") || "",
        localityId: form.getValues("customer.localityId"),
        zoneId: form.getValues("customer.zoneId"),
        type: form.getValues("customer.type"),
      },
      items,
      sale_channel_id: form.getValues("sale_channel_id"),
      requires_delivery: form.getValues("requires_delivery"),
      delivery_address,
      locality_id,
      zone_id,
      purchase_date: form.getValues("purchase_date"),
      scheduled_delivery_date,
      delivery_time,
      total_amount: form.getValues("total_amount"),
      paid_amount: form.getValues("paid_amount"),
      notes: form.getValues("notes") || "",
      status: "",
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
        if (onSuccess) onSuccess("Pedido One-Off creado correctamente.");
        showSnackbar("Pedido One-Off creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el pedido One-Off");
        showSnackbar("Error al guardar el pedido One-Off", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el pedido One-Off");
      showSnackbar(err?.message || "Error al guardar el pedido One-Off", "error");
      console.error(err);
    }
  };

  // Handler para confirmar edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !orderToEdit) return;
    try {
      const result = await onSubmit(pendingValues);
      if (result) {
        if (refreshOrders) await refreshOrders();
        if (onSuccess) onSuccess("Pedido One-Off actualizado correctamente.");
        showSnackbar("Pedido One-Off actualizado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar el pedido One-Off");
        showSnackbar("Error al actualizar el pedido One-Off", "error");
      }
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
        deliveryPreferences={deliveryPreferences}
      />

      {/* Sección Datos de artículos */}
      <OrderOneOffArticlesSection
        form={form}
        setArticles={setArticles}
        articles={articles}
        selectedProductName={selectedProductName}
        setSelectedProductName={setSelectedProductName}
        selectedPriceListName={selectedPriceListName}
        setSelectedPriceListName={setSelectedPriceListName}
      />

      {/* Notas */}
      <ItemFormOrder
        {...form}
        fields={orderOneOffNotesFields}
        hideActions={true}
        onSubmit={() => {}}
        class="notes-order"
      />

      {/* Total */}
      <h3 className="total-order">
        Total Pedido: <b>${form.watch("total_amount")}</b>
      </h3>

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
  );
};

export default OrderOneOffForm;