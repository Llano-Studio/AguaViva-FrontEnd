import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateOrderDTO, OrderItemInput, OrderItemInputForm,  CreateOrderFormDTO } from "../../interfaces/Order";
import { ListItem } from "../common/ListItem";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { useFormOrder } from "../../hooks/useFormOrder";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderClientFields, orderPedidoFields, orderArticleFields } from "../../config/orders/orderFieldsConfig";
import { calculatePriceUnitAndTotal } from "../../utils/calculatePriceProductUnitAndTotal";
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

const initialArticle = { product_id: 0, quantity: 1, price_list_id: 1, notes: "", abono_id: "" };

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
  const [selectedMobileId, setSelectedMobileId] = useState<number | null>(null);

  // Formulario articulos
  const [selectedAbonoName, setSelectedAbonoName] = useState<string>("-");
  const [abonoSelected, setAbonoSelected] = useState<null | number>(null); 
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedPriceListName, setSelectedPriceListName] = useState<string>("");

  // Hook de lógica
  const {
    fetchClients,
    fetchProducts,
    fetchProductById,
    fetchClientDetails,
    fetchZoneMobiles,
    fetchSubscriptionsByCustomer,
    fetchProductsBySubscriptionPlan,
    fetchPriceLists, 
    clientDetails,
    zoneMobiles,
    clearClientAndMobiles,
  } = useFormOrder();

  // Artículo temporal para agregar
  const [articleData, setArticleData] = useState<OrderItemInput & { abono?: string }>(initialArticle);

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
    price_total: oi.price_total || "0",
    image_url: oi.image_url || "",
    is_returnable: oi.is_returnable || false,
  })) ?? []);

  const form = useForm<CreateOrderFormDTO>({
    defaultValues: {
      customer_id: orderToEdit?.customer_id ?? 0,
      contract_id: orderToEdit?.contract_id,
      subscription_id: orderToEdit?.subscription_id,
      sale_channel_id: orderToEdit?.sale_channel_id ?? 0,
      order_date: orderToEdit?.order_date ?? new Date().toISOString().slice(0, 10),
      scheduled_delivery_date: orderToEdit?.scheduled_delivery_date ?? new Date().toISOString().slice(0, 10),
      delivery_time: orderToEdit?.delivery_time ?? "",
      total_amount: orderToEdit?.total_amount ?? "0",
      paid_amount: orderToEdit?.paid_amount ?? "0",
      order_type: orderToEdit?.order_type ?? "HYBRID",
      status: orderToEdit?.status ?? "PENDING",
      notes: orderToEdit?.notes ?? "",
      items: [],
      customer_address: "",
      customer_id_display: undefined,
      zone: "",
      mobile: "",
    }
  });

  // Form para artículos
  const articleForm = useForm<typeof articleData>({
    defaultValues: initialArticle
  });

  useEffect(() => {
    articleForm.setValue("price_list_id", 1);
    fetchPriceLists().then(lists => {
      const general = lists.find((pl: any) => pl.price_list_id === 1);
      if (general) {
        setSelectedPriceListName(general.name);
      } else {
        setSelectedPriceListName("");
      }
    });
  }, []);


  // Handler para seleccionar cliente
  const handleClientSelect = async (client: any) => {
    setSelectedClient(client);
    console.log("Cliente seleccionado:", client);
    form.setValue("customer_id", client.person_id);
    form.setValue("customer_address", client.address || "");
    form.setValue("customer_id_display", client.person_id || "");

    // Traer detalles del cliente y móviles de la zona
    const details = await fetchClientDetails(client.person_id);
    console.log("Detalles del cliente:", details);
    if (details?.zone?.zone_id) {
      form.setValue("zone", details.zone.name || "");
      const mobiles = await fetchZoneMobiles(details.zone.zone_id);
      if (mobiles.length > 0) {
        console.log("Móviles de la zona:", mobiles);
        setSelectedMobileId(mobiles[0].id);
        form.setValue("mobile", String(mobiles[0].id));
      } else {
        setSelectedMobileId(null);
        form.setValue("mobile", "");
      }
    } else {
      form.setValue("zone", "");
      setSelectedMobileId(null);
      form.setValue("mobile", "");
    }
  };

  // Handler para agregar artículo
  const handleAddArticle = async (values: FormData | (OrderItemInputForm & { abono?: string })) => {
    if (values instanceof FormData) return;
    if (!values.product_id || !values.quantity) return;

    const product = await fetchProductById(values.product_id);

    let price_unit = "0";
    let price_total = "0";
    if (!values.abono) {
      const priceData = await calculatePriceUnitAndTotal(
        values.product_id,
        values.price_list_id ?? 1,
        values.quantity
      );
      price_unit = priceData.price_unit || "0";
      price_total = priceData.price_total || "0";
    }

    // Busca los nombres
    const product_name = product?.description || "";
    const price_list = await fetchPriceLists();
    const price_list_name = price_list.find((pl: any) => pl.price_list_id === values.price_list_id)?.name || "";
    const abono_name = selectedAbonoName || "";

    const newArticle = {
      product_id: values.product_id,
      product_name,
      quantity: values.quantity,
      price_list_id: values.price_list_id,
      price_list_name,
      notes: values.notes,
      abono: values.abono || "",
      abono_name,
      price_unit,
      price_total,
      image_url: product?.image_url || "",
      is_returnable: product?.is_returnable || false,
    };

    setArticles(prev => [...prev, newArticle]);
    articleForm.reset(initialArticle);
    setSelectedAbonoName("-");
    setAbonoSelected(null);
    setSelectedProductName("");
  };

  // Handler para eliminar artículo
  const handleRemoveArticle = (item: OrderItemInput) => {
    setArticles(prev => prev.filter(a =>
      !(a.product_id === item.product_id && a.quantity === item.quantity && a.price_list_id === item.price_list_id && a.notes === item.notes)
    ));
  };

  // Handler para submit
  const handleSubmit = async (values: CreateOrderDTO | FormData) => {
    const data: CreateOrderDTO = {
      ...values as CreateOrderDTO,
      customer_id: selectedClient?.id ?? form.getValues("customer_id"),
      items: articles,
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

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={classForm}>
      {/* Datos del cliente */}
      <fieldset className="order-section">
        <legend>Datos del cliente</legend>
        <ItemFormOrder
          {...form}
          fields={orderClientFields}
          hideActions
          onSubmit={() => {}}
          searchFieldProps={{
            customer_id: {
              value: selectedClient?.name || "",
              fetchOptions: fetchClients,
              renderOption: (client: any) => <span>{client.name}</span>,
              onOptionSelect: handleClientSelect,
              placeholder: "Buscar cliente...",
              class: "order"
            }
          }}
        />
      </fieldset>

      {/* Datos del pedido */}
      <fieldset className="order-section">
        <legend>Datos del pedido</legend>
        <ItemFormOrder
          {...form}
          fields={orderPedidoFields}
          hideActions
          onSubmit={() => {}}
          selectFieldProps={{
            mobile: {
              options: zoneMobiles.map(mobile => ({
                label: mobile.name || mobile.plate,
                value: String(mobile.id)
              })),
              value: form.watch("mobile") || "",
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                setSelectedMobileId(Number(e.target.value));
                form.setValue("mobile", e.target.value);
              }
            }
          }}
        />
      </fieldset>

      {/* Sección Datos de artículos */}
      <fieldset className="order-section">
        <legend>Datos de artículos</legend>
        <ItemFormOrder<OrderItemInput & { abono_id?: string }>
          {...articleForm}
          fields={
            abonoSelected === null
              ? orderArticleFields // Mostrar todos los campos, incluyendo price_list_id
              : orderArticleFields.filter(f => f.name !== "price_list_id") // Ocultar price_list_id si hay abono seleccionado
          }
          searchFieldProps={{
            abono: {
              value: selectedAbonoName,
              fetchOptions: async (query: string) => {
                if (!selectedClient?.person_id) return [{ isNone: true, subscription_plan: { name: "-" } }];
                const subs = await fetchSubscriptionsByCustomer(selectedClient.person_id, query);
                return [{ isNone: true, subscription_plan: { name: "-" } }, ...subs];
              },
              renderOption: (sub: any) => <span>{sub.subscription_plan?.name}</span>,
              onOptionSelect: (sub: any) => {
                if (sub.isNone) {
                  articleForm.setValue("abono", "");
                  setSelectedAbonoName("-");
                  setAbonoSelected(null);
                } else {
                  articleForm.setValue("abono", sub.subscription_plan?.subscription_plan_id);
                  setSelectedAbonoName(sub.subscription_plan?.name || "");
                  setAbonoSelected(sub.subscription_plan?.subscription_plan_id);
                }
              },
              placeholder: "Seleccionar abono...",
              class: "order"
            },
            product_id: {
              value: selectedProductName || "",
              fetchOptions: async (query: string) => {
                if (abonoSelected !== null) {
                  const products = await fetchProductsBySubscriptionPlan(abonoSelected);
                  // Filtra por query si quieres
                  if (query) {
                    return products.filter((p: any) =>
                      p.product_description.toLowerCase().includes(query.toLowerCase())
                    );
                  }
                  return products;
                } else {
                  return await fetchProducts(query);
                }
              },
              renderOption: (product: any) => <span>{product.product_description || product.description}</span>,
              onOptionSelect: (product: any) => {
                articleForm.setValue("product_id", product.product_id);
                setSelectedProductName(product.product_description || product.description || "");
              },
              placeholder: "Buscar artículo...",
              class: "order"
            },
            price_list_id: {
              value: selectedPriceListName,
              fetchOptions: async (query: string) => {
                const lists = await fetchPriceLists(query);
                // Filtra las listas que incluyan el producto seleccionado
                if (articleForm.watch("product_id")) {
                  const filtered = lists.filter((pl: any) =>
                    pl.price_list_item?.some((item: any) => item.product_id === articleForm.watch("product_id"))
                  );
                  return filtered;
                }
                return lists;
              },
              renderOption: (pl: any) => <span>{pl.name}</span>,
              onOptionSelect: (pl: any) => {
                articleForm.setValue("price_list_id", pl.price_list_id);
                setSelectedPriceListName(pl.name || "");
              },
              placeholder: "Buscar lista de precios...",
              class: "order"
            }
          }}
          onSubmit={handleAddArticle}
          hideActions={false}
        />
        <div style={{ marginTop: 16 }}>
          <ListItem
            items={articles}
            columns={[
              { header: "", accessor: "image_url" },
              { header: "Artículo", accessor: "product_name" },
              { header: "Cantidad", accessor: "quantity" },
              { header: "Precio Unidad", accessor: "price_unit" },
              { 
                header: "Abono", 
                accessor: "abono_name",
                render: (item) => item.abono_id && item.abono_id !== "" ? item.abono_id : "-"
              },
              {
                header: "Retornable",
                accessor: "is_returnable",
                render: (item) => item.is_returnable ? "Sí" : "No"
              },
              { header: "Lista de precios", accessor: "price_list_name" },
              { header: "Precio Total", accessor: "price_total"},
            ]}
            getKey={item => `${item.product_id}-${item.price_list_id ?? ""}-${item.notes ?? ""}`}
            onRemove={handleRemoveArticle}
          />
        </div>
      </fieldset>

      {error && <div className="error-message">{error}</div>}

      <div className="order-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
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