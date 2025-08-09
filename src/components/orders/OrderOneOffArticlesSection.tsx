import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderOneOffArticleFields } from "../../config/orders/orderFieldsConfig";
import { ListItem } from "../common/ListItem";
import { OrderListItemColumns } from "../../config/orders/OrderListItemColumns";
import { useFormOrder } from "../../hooks/useFormOrder";
import { OrderOneOffItemInputForm } from "../../interfaces/OrderOneOff";
import { calculatePriceTotalOrder } from "../../utils/calculatePriceTotalOrder";
import { calculatePriceUnitAndTotalOfItem } from "../../utils/calculatePriceProductUnitAndTotalOfItem";

interface OrderOneOffArticlesSectionProps {
  form: any;
  articles: OrderOneOffItemInputForm[];
  setArticles: React.Dispatch<React.SetStateAction<OrderOneOffItemInputForm[]>>;
  selectedProductName: string;
  setSelectedProductName: (name: string) => void;
  selectedPriceListName: string;
  setSelectedPriceListName: (name: string) => void;
}

export const OrderOneOffArticlesSection: React.FC<OrderOneOffArticlesSectionProps> = ({
  form,
  articles,
  setArticles,
  selectedProductName,
  setSelectedProductName,
  selectedPriceListName,
  setSelectedPriceListName,
}) => {
  const { fetchProducts, fetchPriceLists, fetchProductById } = useFormOrder();

  const initialArticle = { product_id: 0, quantity: 1, price_list_id: 1, notes: "" };
  const articleForm = useForm<typeof initialArticle>({
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
const handleAddArticle = async (values: typeof initialArticle | FormData) => {
  if (values instanceof FormData) return;
  if (!values.product_id || !values.quantity) return;

  const product = await fetchProductById(values.product_id);

  // Calcula el precio unitario y total igual que en OrderArticlesSection
  const priceData = await calculatePriceUnitAndTotalOfItem(
    values.product_id,
    values.price_list_id ?? 1,
    values.quantity
  );
  const price_unit = priceData.price_unit || "0";
  const price_total_item = priceData.price_total_item || "0";

  const price_list = await fetchPriceLists();
  const price_list_name = price_list.find((pl: any) => pl.price_list_id === values.price_list_id)?.name || "";

  setArticles(prev => [
    ...prev,
    {
      product_id: values.product_id,
      product_name: product?.description || "",
      quantity: values.quantity,
      price_list_id: values.price_list_id,
      price_list_name: price_list_name,
      notes: values.notes,
      price_unit,
      price_total_item,
      image_url: product?.image_url || "",
      is_returnable: product?.is_returnable || false,
    }
  ]);
  articleForm.reset(initialArticle);
  setSelectedProductName("");
  setSelectedPriceListName(price_list_name);
};

  // Handler para eliminar artículo
  const handleRemoveArticle = (item: any) => {
    setArticles(prev =>
      prev.filter(a =>
        !(a.product_id === item.product_id && a.quantity === item.quantity && a.price_list_id === item.price_list_id && a.notes === item.notes)
      )
    );
  };

  return (
    <fieldset className="order-section">
      <legend>Datos de artículos</legend>
      <ItemFormOrder
        {...articleForm}
        fields={orderOneOffArticleFields}
        searchFieldProps={{
          product_id: {
            value: selectedProductName || "",
            fetchOptions: async (query: string) => await fetchProducts(query),
            renderOption: (product: any) => <span>{product.description}</span>,
            onOptionSelect: (product: any) => {
              articleForm.setValue("product_id", product.product_id);
              setSelectedProductName(product.description || "");
            },
            placeholder: "Buscar artículo...",
            class: "order"
          },
          price_list_id: {
            value: selectedPriceListName,
            fetchOptions: async (query: string) => {
              if (!articleForm.watch("product_id")) return [];
              const lists = await fetchPriceLists(query);
              // Filtra listas que tengan el producto seleccionado
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
    </fieldset>
  );
};