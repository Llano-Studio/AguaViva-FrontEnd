import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderArticleFields } from "../../config/orders/orderFieldsConfig";
import { Field } from "../../interfaces/Common";
import { ListItem } from "../common/ListItem";
import { OrderListItemColumns } from "../../config/orders/OrderListItemColumns";
import { useFormOrder } from "../../hooks/useFormOrder";
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
}) => {


  // Hook de lógica
  const {
  fetchProducts,
  fetchSubscriptionsByCustomer,
  fetchProductsBySubscriptionPlan,
  fetchPriceLists,
  fetchProductById,
  } = useFormOrder();


  const initialArticle = { product_id: 0, quantity: 1, price_list_id: 1, notes: "", abono_id: "" };
  const [articleData, setArticleData] = useState<OrderItemInput & { abono?: string }>(initialArticle);
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


  // Handler para agregar artículo
  const handleAddArticle = async (values: FormData | (OrderItemInputForm & { abono?: string })) => {
    if (values instanceof FormData) return;
    if (!values.product_id || !values.quantity) return;

    const product = await fetchProductById(values.product_id);

    let price_unit = "0";
    let price_total_item = "0";
    if (!values.abono) {
      const priceData = await calculatePriceUnitAndTotalOfItem(
        values.product_id,
        values.price_list_id ?? 1,
        values.quantity
      );
      price_unit = priceData.price_unit || "0";
      price_total_item = priceData.price_total_item || "0";
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
      price_total_item,
      image_url: product?.image_url || "",
      is_returnable: product?.is_returnable || false,
    };

    setArticles(prev => [...prev, newArticle]);
    console.log("Artículo agregado:", newArticle);
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


  return (
    <fieldset className="order-section">
      <legend>Datos de artículos</legend>
      <ItemFormOrder
        {...articleForm}
        fields={
          abonoSelected === null
            ? orderArticleFields
            : orderArticleFields.filter((f: Field<any>) => f.name !== "price_list_id")
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
              if (!articleForm.watch("product_id")) return []; // No buscar si no hay producto
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
            disabled: !articleForm.watch("product_id"), // Deshabilita si no hay producto seleccionado
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