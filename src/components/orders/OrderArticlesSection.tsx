import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderArticleFields } from "../../config/orders/orderFieldsConfig";
import { Field } from "../../interfaces/Common";
import { ListItem } from "../common/ListItem";
import { OrderListItemColumns } from "../../config/orders/OrderListItemColumns";
import { useFormOrder } from "../../hooks/useFormOrder";
import { useOrders } from "../../hooks/useOrders";
import { OrderItemInput, OrderItemInputForm } from "../../interfaces/Order";
import { calculatePriceUnitAndTotalOfItem } from "../../utils/calculatePriceProductUnitAndTotalOfItem";
import { calculatePriceTotalOrder } from "../../utils/calculatePriceTotalOrder";
import {
  calculateQuantityCredits,
  applyCreditDelta,
  generateCreditsLegendHTML,
} from "../../utils/orderCreditsCalculate";

interface OrderArticlesSectionProps {
  form: any;
  abonoSelected: any;
  selectedAbonoName: string;
  selectedClient: any;
  articles: OrderItemInputForm[];
  setArticles: React.Dispatch<React.SetStateAction<OrderItemInputForm[]>>;
  setSelectedAbonoName: (name: string) => void;
  setAbonoSelected: (id: any) => void;
  selectedProductName: string;
  setSelectedProductName: (name: string) => void;
  selectedPriceListName: string;
  setSelectedPriceListName: (name: string) => void;
  handleSubscriptionChange: (subscription_id: number) => void;
}

export const OrderArticlesSection: React.FC<OrderArticlesSectionProps> = ({
  form,
  abonoSelected,
  setArticles,
  selectedAbonoName,
  selectedClient,
  setSelectedAbonoName,
  setAbonoSelected,
  selectedProductName,
  setSelectedProductName,
  selectedPriceListName,
  setSelectedPriceListName,
  articles,
  handleSubscriptionChange,
}) => {
  // Hooks (NO desestructurar funciones dentro de objetos creados cada render)
  const formOrder = useFormOrder();
  const ordersHook = useOrders();

  const {
    fetchProducts,
    fetchSubscriptionsByCustomer,
    fetchProductsBySubscriptionPlan,
    fetchPriceLists,
    fetchProductById,
  } = formOrder;

  const { getAvailableCreditsBySubscription } = ordersHook;

  const initialArticle = { product_id: 0, quantity: 1, price_list_id: 1, notes: "", abono_id: "" };
  const articleForm = useForm<(OrderItemInput & { abono?: string })>({
    defaultValues: initialArticle,
  });

  const [availableCredits, setAvailableCredits] = useState<any[]>([]);
  const [abonoSubscriptionId, setAbonoSubscriptionId] = useState<number | null>(null);
  const [productInputValue, setProductInputValue] = useState("");

  // Guard para precio lista por defecto (solo una vez)
  const priceListInit = useRef(false);

  // Créditos (solo cuando cambia id)
  useEffect(() => {
    let active = true;
    (async () => {
      if (!abonoSubscriptionId) {
        if (availableCredits.length !== 0) setAvailableCredits([]);
        return;
      }
      try {
        const credits = await getAvailableCreditsBySubscription(abonoSubscriptionId);
        if (active) setAvailableCredits(credits);
      } catch {
        if (active) setAvailableCredits([]);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abonoSubscriptionId]);

  // Abono por defecto al cambiar cliente
  useEffect(() => {
    const load = async () => {
      articleForm.setValue("abono", "");
      setSelectedAbonoName("-");
      setAbonoSelected(null);
      setAbonoSubscriptionId(null);
      if (!selectedClient?.person_id) return;
      try {
        const subs = await fetchSubscriptionsByCustomer(selectedClient.person_id, "", { status: "ACTIVE" });
        const first = subs?.[0];
        if (first) {
          articleForm.setValue("abono", first.subscription_plan?.subscription_plan_id);
          setSelectedAbonoName(first.subscription_plan?.name || "-");
          setAbonoSelected(first.subscription_plan?.subscription_plan_id);
          setAbonoSubscriptionId(first.subscription_id);
          form.setValue("subscription_id", first.subscription_id);
          handleSubscriptionChange(first.subscription_id);
        }
      } catch {}
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.person_id]);

  // Precio lista default (una sola vez)
  useEffect(() => {
    if (priceListInit.current) return;
    priceListInit.current = true;
    (async () => {
      articleForm.setValue("price_list_id", 1);
      try {
        const lists = await fetchPriceLists();
        const general = lists.find((pl: any) => pl.price_list_id === 1);
        setSelectedPriceListName(general ? general.name : "");
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcular totales
  useEffect(() => {
    const total = calculatePriceTotalOrder(articles);
    form.setValue("total_amount", total);
    form.setValue("paid_amount", total);
  }, [articles, form]);

  // Leyenda créditos (se calcula simple, sin estado intermedio)
  const creditsLegendHTML = generateCreditsLegendHTML(
    abonoSelected,
    availableCredits,
    articles
  );

  // Agregar artículo
  const handleAddArticle = async (values: FormData | (OrderItemInputForm & { abono?: string })) => {
    if (values instanceof FormData) return;
    if (!values.product_id || !values.quantity) return;

    const product = await fetchProductById(values.product_id);
    const product_name = product?.description || "";
    const priceLists = await fetchPriceLists();
    const price_list_name =
      priceLists.find((pl: any) => pl.price_list_id === values.price_list_id)?.name || "";
    const abono_name = selectedAbonoName || "";

    if (values.abono) {
      const qty = Number(values.quantity);
      const { abonoQty, extraQty } = calculateQuantityCredits(
        availableCredits,
        values.product_id,
        qty
      );
      let consumed = 0;

      if (abonoQty > 0) {
        consumed += abonoQty;
        setArticles(prev => [
            ...prev,
          {
            product_id: values.product_id,
            product_name,
            quantity: abonoQty,
            notes: values.notes,
            abono: values.abono,
            abono_name,
            price_unit: "0",
            price_total_item: "0",
            image_url: product?.image_url || "",
            is_returnable: product?.is_returnable || false,
          },
        ]);
      }

      if (extraQty > 0) {
        const priceData = await calculatePriceUnitAndTotalOfItem(
          values.product_id,
          1,
          extraQty
        );
        setArticles(prev => [
          ...prev,
          {
            product_id: values.product_id,
            product_name,
            quantity: extraQty,
            notes: values.notes,
            abono: "",
            abono_name: "-",
            price_unit: priceData.price_unit || "0",
            price_total_item: priceData.price_total_item || "0",
            price_list_id: 1,
            price_list_name: "Lista General/Estándar",
            image_url: product?.image_url || "",
            is_returnable: product?.is_returnable || false,
          },
        ]);
      }

      if (consumed > 0) {
        setAvailableCredits(prev => applyCreditDelta(prev, values.product_id, -consumed));
      }
    } else {
      const priceData = await calculatePriceUnitAndTotalOfItem(
        values.product_id,
        values.price_list_id ?? 1,
        values.quantity
      );
      setArticles(prev => [
        ...prev,
        {
          product_id: values.product_id,
          product_name,
          quantity: values.quantity,
          notes: values.notes,
          abono: "",
          abono_name: "-",
          price_unit: priceData.price_unit || "0",
          price_total_item: priceData.price_total_item || "0",
          price_list_id: values.price_list_id,
          price_list_name,
          image_url: product?.image_url || "",
          is_returnable: product?.is_returnable || false,
        },
      ]);
    }

    articleForm.reset(initialArticle);
    setSelectedAbonoName("-");
    setAbonoSelected(null);
    setSelectedProductName("");
    setProductInputValue("");
  };

  // Eliminar artículo
  const handleRemoveArticle = (item: OrderItemInput) => {
    setArticles(prev =>
      prev.filter(a =>
        !(
          a.product_id === item.product_id &&
          a.quantity === item.quantity &&
          a.price_list_id === (item as any).price_list_id &&
          a.notes === item.notes
        )
      )
    );
    const isAbonoItem = (item as any).abono && !(item as any).price_list_id;
    if (isAbonoItem) {
      setAvailableCredits(prev =>
        applyCreditDelta(prev, item.product_id, Number(item.quantity))
      );
    }
  };

  // Campos dinámicos (igual lógica, sin memo complejo)
  const orderType = form.watch("order_type");
  const fields =
    abonoSelected === null
      ? (orderType === "ONE_OFF"
          ? orderArticleFields.filter((f: Field<any>) => f.name !== "abono")
          : orderArticleFields)
      : orderArticleFields.filter(
          (f: Field<any>) =>
            f.name !== "price_list_id" &&
            (orderType === "ONE_OFF" ? f.name !== "abono" : true)
        );

  return (
    <fieldset className="order-section">
      <legend>Datos de artículos</legend>
      {creditsLegendHTML && (
        <div
          className="abono-credits-legend"
          style={{ margin: "8px 0", color: "#1976d2" }}
          dangerouslySetInnerHTML={{ __html: creditsLegendHTML }}
        />
      )}

      <ItemFormOrder
        {...articleForm}
        fields={fields}
        searchFieldProps={{
          ...(orderType !== "ONE_OFF" && {
            abono: {
              value: selectedAbonoName,
              fetchOptions: async (query: string) => {
                if (!selectedClient?.person_id)
                  return [{ isNone: true, subscription_plan: { name: "-" } }];
                const subs = await fetchSubscriptionsByCustomer(
                  selectedClient.person_id,
                  query,
                  { status: "ACTIVE" }
                );
                return [{ isNone: true, subscription_plan: { name: "-" } }, ...subs];
              },
              renderOption: (sub: any) => (
                <span>{sub.subscription_plan?.name}</span>
              ),
              onOptionSelect: (sub: any) => {
                if (sub.isNone) {
                  articleForm.setValue("abono", "");
                  setSelectedAbonoName("-");
                  setAbonoSelected(null);
                  setAbonoSubscriptionId(null);
                  form.setValue("subscription_id", undefined);
                  setAvailableCredits([]);
                } else {
                  articleForm.setValue(
                    "abono",
                    sub.subscription_plan?.subscription_plan_id
                  );
                  setSelectedAbonoName(sub.subscription_plan?.name || "");
                  setAbonoSelected(sub.subscription_plan?.subscription_plan_id);
                  setAbonoSubscriptionId(sub.subscription_id);
                  handleSubscriptionChange(sub.subscription_id);
                  form.setValue("subscription_id", sub.subscription_id);
                }
              },
              placeholder: "Seleccionar abono...",
              class: "order",
            },
          }),
          product_id: {
            value: productInputValue,
            fetchOptions: async (query: string) => {
              if (abonoSelected !== null) {
                const products = await fetchProductsBySubscriptionPlan(abonoSelected);
                if (query) {
                  return products.filter((p: any) =>
                    (p.product_description || p.description || "")
                      .toLowerCase()
                      .includes(query.toLowerCase())
                  );
                }
                return products;
              }
              return await fetchProducts(query);
            },
            renderOption: (product: any) => (
              <span>{product.product_description || product.description}</span>
            ),
            onOptionSelect: (product: any) => {
              articleForm.setValue("product_id", product.product_id);
              const name = product.product_description || product.description || "";
              setProductInputValue(name);
              setSelectedProductName(name);
            },
            onChange: (val: string) => setProductInputValue(val),
            placeholder: "Buscar artículo...",
            class: "order",
          },
          price_list_id: {
            value: selectedPriceListName,
            fetchOptions: async (query: string) => {
              const pid = articleForm.watch("product_id");
              if (!pid) return [];
              const lists = await fetchPriceLists(query);
              return lists.filter((pl: any) =>
                pl.price_list_item?.some((it: any) => it.product_id === pid)
              );
            },
            renderOption: (pl: any) => <span>{pl.name}</span>,
            onOptionSelect: (pl: any) => {
              articleForm.setValue("price_list_id", pl.price_list_id);
              setSelectedPriceListName(pl.name || "");
            },
            placeholder: "Buscar lista de precios...",
            class: "order",
            disabled: !articleForm.watch("product_id"),
          },
        }}
        onSubmit={handleAddArticle}
        hideActions={false}
      />

      <div style={{ marginTop: 16 }}>
        <ListItem
          items={articles}
          columns={OrderListItemColumns}
          getKey={(item) =>
            `${item.product_id}-${(item as any).price_list_id ?? "abono"}-${item.notes ?? ""}`
          }
          onRemove={handleRemoveArticle}
        />
      </div>

      <h3 className="total-order">
        Total Pedido: <b>${form.watch("total_amount")}</b>
      </h3>
    </fieldset>
  );
};