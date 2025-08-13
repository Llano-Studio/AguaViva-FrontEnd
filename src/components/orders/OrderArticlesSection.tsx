import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderArticleFields } from "../../config/orders/orderFieldsConfig";
import { Field } from "../../interfaces/Common";
import { ListItem } from "../common/ListItem";
import { OrderListItemColumns } from "../../config/orders/OrderListItemColumns";
import { useFormOrder } from "../../hooks/useFormOrder";
import { useOrders } from "../../hooks/useOrders";
import { CreateOrderDTO, OrderItemInput, OrderItemInputForm,  CreateOrderFormDTO } from "../../interfaces/Order";
import { calculatePriceUnitAndTotalOfItem } from "../../utils/calculatePriceProductUnitAndTotalOfItem";
import { calculatePriceTotalOrder } from "../../utils/calculatePriceTotalOrder";

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
  // Hook de lógica
  const {
    fetchProducts,
    fetchSubscriptionsByCustomer,
    fetchProductsBySubscriptionPlan,
    fetchPriceLists,
    fetchProductById,
  } = useFormOrder();

  const {
    getAvailableCreditsBySubscription
  } = useOrders();

  const initialArticle = { product_id: 0, quantity: 1, price_list_id: 1, notes: "", abono_id: "" };
  const [articleData, setArticleData] = useState<OrderItemInput & { abono?: string }>(initialArticle);
  // Form para artículos
  const articleForm = useForm<typeof articleData>({
    defaultValues: initialArticle
  });

  // Estado para créditos disponibles del abono
  const [availableCredits, setAvailableCredits] = useState<any[]>([]);
  const [abonoSubscriptionId, setAbonoSubscriptionId] = useState<number | null>(null);

  const [productInputValue, setProductInputValue] = useState("");

  // Actualiza los créditos disponibles cada vez que cambia el abono seleccionado o los artículos
  useEffect(() => {
    const fetchCredits = async () => {
      if (abonoSubscriptionId) {
        const credits = await getAvailableCreditsBySubscription(Number(abonoSubscriptionId));
        setAvailableCredits(credits);
      } else {
        setAvailableCredits([]);
      }
    };
    fetchCredits();
  }, [abonoSubscriptionId]);

  useEffect(() => {
    setDefaultAbono();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  const setDefaultAbono = async () => {
      // Resetea todo primero
      articleForm.setValue("abono", "");
      setSelectedAbonoName("-");
      setAbonoSelected(null);
      setAbonoSubscriptionId(null);

      // Si hay cliente seleccionado, busca sus abonos
      if (selectedClient?.person_id) {
        const subs = await fetchSubscriptionsByCustomer(selectedClient.person_id, "");
        const firstSub = subs && subs.length > 0 ? subs[0] : null;
        if (firstSub) {
          articleForm.setValue("abono", firstSub.subscription_plan?.subscription_plan_id);
          setSelectedAbonoName(firstSub.subscription_plan?.name || "-");
          setAbonoSelected(firstSub.subscription_plan?.subscription_plan_id);
          setAbonoSubscriptionId(firstSub.subscription_id);
          form.setValue("subscription_id", firstSub.subscription_id);
          handleSubscriptionChange(firstSub.subscription_id);
        }
      }
    };  


  // Leyenda de créditos disponibles para el abono actual
  const getCreditsLegend = () => {
    if (!abonoSelected || availableCredits.length === 0) return null;

    // Copia los créditos para ir restando
    const creditsCopy = availableCredits.map(c => ({ ...c }));

    // Resta la cantidad ya usada en artículos del abono
    articles.forEach(item => {
      if (!item.price_list_id) {
        const credit = creditsCopy.find(c => c.product_id === item.product_id);
        if (credit) {
          credit.remaining_balance -= Number(item.quantity);
        }
      }
    });

    // Filtra solo los productos con saldo disponible
    const legendParts = creditsCopy
      .filter(c => c.remaining_balance > 0)
      .map(
        c => `<b>${c.remaining_balance}</b> ${c.product_description}`
      );

    if (legendParts.length === 0) {
      return (
        <div
          className="abono-credits-legend"
          style={{ margin: "8px 0", color: "#1976d2" }}
        >
          No hay créditos disponibles para el abono seleccionado
        </div>
      );
    }

    // Arma la leyenda con formato natural
    let legendText = "";
    if (legendParts.length === 1) {
      legendText = legendParts[0];
    } else if (legendParts.length === 2) {
      legendText = `${legendParts[0]} y ${legendParts[1]}`;
    } else {
      legendText = `${legendParts.slice(0, -1).join(", ")} y ${legendParts[legendParts.length - 1]}`;
    }

    return (
      <div
        className="abono-credits-legend"
        style={{ margin: "8px 0", color: "#1976d2" }}
        dangerouslySetInnerHTML={{
          __html: `El cliente tiene disponible ${legendText} para el abono seleccionado`
        }}
      />
    );
  };

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

  // Handler para agregar artículo
  const handleAddArticle = async (values: FormData | (OrderItemInputForm & { abono?: string })) => {
    if (values instanceof FormData) return;
    if (!values.product_id || !values.quantity) return;

    const product = await fetchProductById(values.product_id);

    let price_unit = "0";
    let price_total_item = "0";
    const product_name = product?.description || "";
    const price_list = await fetchPriceLists();
    const price_list_name = price_list.find((pl: any) => pl.price_list_id === values.price_list_id)?.name || "";
    const abono_name = selectedAbonoName || "";

    if (values.abono) {
      // Si hay abono, calcula créditos
      const qty = Number(values.quantity);
      const creditsResult = await calculateQuantityCredits(Number(abonoSubscriptionId), values.product_id, qty);

      for (const { abonoQty, extraQty } of creditsResult) {
        if (abonoQty > 0) {
          setArticles(prev => [
            ...prev,
            {
              product_id: values.product_id,
              product_name,
              quantity: abonoQty,
              notes: values.notes,
              abono: values.abono,
              abono_name,
              price_unit,
              price_total_item,
              image_url: product?.image_url || "",
              is_returnable: product?.is_returnable || false,
            }
          ]);
        }
        if (extraQty > 0) {
          // Calcular precio para el excedente
          const priceData = await calculatePriceUnitAndTotalOfItem(
            values.product_id,
            1, // price_list_id = 1 para producto suelto
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
            }
          ]);
        }
      }
    }
    else {
      // Producto suelto normal
      if (!values.abono) {
        const priceData = await calculatePriceUnitAndTotalOfItem(
          values.product_id,
          values.price_list_id ?? 1,
          values.quantity
        );
        price_unit = priceData.price_unit || "0";
        price_total_item = priceData.price_total_item || "0";
      }
      setArticles(prev => [
        ...prev,
        {
          product_id: values.product_id,
          product_name,
          quantity: values.quantity,
          notes: values.notes,
          abono: "",
          abono_name: "-",
          price_unit,
          price_total_item,
          price_list_id: values.price_list_id,
          price_list_name,
          image_url: product?.image_url || "",
          is_returnable: product?.is_returnable || false,
        }
      ]);
    }

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

  const calculateQuantityCredits = async (abonoId: number, productId: number, quantity: number) => {
    const credits = await getAvailableCreditsBySubscription(abonoId);
    const credit = credits.find((c: any) => c.product_id === productId);
    const remaining = credit?.remaining_balance ?? 0;

    if (quantity <= remaining) {
      // Todo entra en el abono
      return [
        { abonoQty: quantity, extraQty: 0 }
      ];
    } else {
      // Parte entra en abono, parte como producto suelto
      return [
        { abonoQty: remaining, extraQty: quantity - remaining }
      ];
    }
  };

  return (
    <fieldset className="order-section">
      <legend>Datos de artículos</legend>
      {getCreditsLegend()}
      <ItemFormOrder
        {...articleForm}
        fields={
          abonoSelected === null
            ? (
                form.watch("order_type") === "ONE_OFF"
                  ? orderArticleFields.filter((f: Field<any>) => f.name !== "abono")
                  : orderArticleFields
              )
            : orderArticleFields.filter((f: Field<any>) => f.name !== "price_list_id" && (form.watch("order_type") === "ONE_OFF" ? f.name !== "abono" : true))
        }
        searchFieldProps={{
          ...(form.watch("order_type") !== "ONE_OFF" && {
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
                  form.setValue("subscription_id", undefined);
                } else {
                  articleForm.setValue("abono", sub.subscription_plan?.subscription_plan_id);
                  setSelectedAbonoName(sub.subscription_plan?.name || "");
                  setAbonoSelected(sub.subscription_plan?.subscription_plan_id);
                  setAbonoSubscriptionId(sub.subscription_id); 
                  handleSubscriptionChange(sub.subscription_id);
                  form.setValue("subscription_id", sub.subscription_id);
                }
              },
              placeholder: "Seleccionar abono...",
              class: "order"
            }
          }),
          product_id: {
            value: productInputValue,
            fetchOptions: async (query: string) => {
              if (abonoSelected !== null) {
                const products = await fetchProductsBySubscriptionPlan(abonoSelected);
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
              setProductInputValue(product.product_description || product.description || "");
              setSelectedProductName(product.product_description || product.description || "");
            },
            onChange: (val: string) => {
              setProductInputValue(val);
            },
            placeholder: "Buscar artículo...",
            class: "order"
          },
          price_list_id: {
            value: selectedPriceListName,
            fetchOptions: async (query: string) => {
              if (!articleForm.watch("product_id")) return [];
              const lists = await fetchPriceLists(query);
              const filtered = lists.filter((pl: any) =>
                pl.price_list_item?.some((item: any) => item.product_id === articleForm.watch("product_id"))
              );
              return filtered;
            },
            renderOption: (pl: any) => <span>{pl.name}</span>,
            onOptionSelect: (pl: any) => {
              articleForm.setValue("price_list_id", pl.price_list_id);
              setSelectedPriceListName(pl.name || "");
            },
            placeholder: "Buscar lista de precios...",
            class: "order",
            disabled: !articleForm.watch("product_id"),
          }
        }}
        onSubmit={handleAddArticle}
        hideActions={false}
      />
      <div style={{ marginTop: 16 }}>
        <ListItem
          items={articles}
          columns={OrderListItemColumns}
          getKey={item => `${item.product_id}-${item.price_list_id ?? ""}-${item.notes ?? ""}`}
          onRemove={handleRemoveArticle}
        />
      </div>

      <h3 className="total-order">
        Total Pedido: <b>${form.watch("total_amount")}</b>
      </h3>
    </fieldset>
  );
};