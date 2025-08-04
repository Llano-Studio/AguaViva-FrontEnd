import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ItemFormOrder } from "../common/ItemFormOrder";
import { orderOneOffArticleFields } from "../../config/orders/orderFieldsConfig";
import { ListItem } from "../common/ListItem";
import { OrderListItemColumns } from "../../config/orders/OrderListItemColumns";
import { useFormOrder } from "../../hooks/useFormOrder";

interface OrderOneOffArticlesSectionProps {
  form: any;
  articles: any[];
  setArticles: (articles: any[]) => void;
}

export const OrderOneOffArticlesSection: React.FC<OrderOneOffArticlesSectionProps> = ({
  form,
  articles,
  setArticles,
}) => {
  const { fetchProducts, fetchPriceLists, fetchProductById } = useFormOrder();

  // Form para artículos
  const initialArticle = { product_id: 0, quantity: 1, price_list_id: 1, notes: "" };
  const articleForm = useForm<typeof initialArticle>({
    defaultValues: initialArticle
  });

  useEffect(() => {
    articleForm.setValue("price_list_id", 1);
    // No seteamos price_list_name porque no existe en el tipo
  }, []);

  // Handler para agregar artículo
    const handleAddArticle = (values: typeof initialArticle | FormData) => {
    // Si es FormData, no hacemos nada (o puedes adaptarlo si lo necesitas)
    if (values instanceof FormData) return;

    (async () => {
        if (!values.product_id || !values.quantity) return;

        const product = await fetchProductById(values.product_id);
        const price_list = await fetchPriceLists();
        const price_list_name = price_list.find((pl: any) => pl.price_list_id === values.price_list_id)?.name || "";

        setArticles([
        ...articles,
        {
            product_id: values.product_id,
            product_name: product?.description || "",
            quantity: values.quantity,
            notes: values.notes,
            price_list_id: values.price_list_id,
            price_list_name,
            image_url: product?.image_url || "",
            is_returnable: product?.is_returnable || false,
        }
        ]);
        articleForm.reset(initialArticle);
    })();
    };

  // Handler para eliminar artículo
  const handleRemoveArticle = (item: any) => {
    setArticles(articles.filter(a =>
      !(a.product_id === item.product_id && a.quantity === item.quantity && a.price_list_id === item.price_list_id && a.notes === item.notes)
    ));
  };

  return (
    <fieldset className="order-section">
      <legend>Datos de artículos</legend>
      <ItemFormOrder
        {...articleForm}
        fields={orderOneOffArticleFields}
        searchFieldProps={{
          product_id: {
            value: articleForm.watch("product_id") || "",
            fetchOptions: async (query: string) => await fetchProducts(query),
            renderOption: (product: any) => <span>{product.description}</span>,
            onOptionSelect: (product: any) => {
              articleForm.setValue("product_id", product.product_id);
            },
            placeholder: "Buscar artículo...",
            class: "order"
          },
          price_list_id: {
            value: articleForm.watch("price_list_id") || "",
            fetchOptions: async (query: string) => await fetchPriceLists(query),
            renderOption: (pl: any) => <span>{pl.name}</span>,
            onOptionSelect: (pl: any) => {
              articleForm.setValue("price_list_id", pl.price_list_id);
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