import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreatePriceListDTO, PriceList } from "../../interfaces/PriceList";
import { ItemForm } from "../common/ItemForm";
import { priceListFields } from "../../config/priceLists/priceListFieldsConfig";
import { usePriceLists } from "../../hooks/usePriceLists";
import { AddItem } from "../common/AddItem";
import { ListItem } from "../common/ListItem";
import { priceListItemListColumns } from "../../config/priceLists/priceListItemListColumns";
import useProducts from "../../hooks/useProducts";
import { usePriceListItems } from "../../hooks/usePriceListItem";

interface PriceListFormProps {
  onCancel: () => void;
  isEditing: boolean;
  priceListToEdit?: PriceList | null;
  refreshPriceLists: () => Promise<void>;
  class?: string;
}

const getInitialValues = (
  isEditing: boolean,
  priceListToEdit?: PriceList | null
): CreatePriceListDTO => {
  if (isEditing && priceListToEdit) {
    return {
      name: priceListToEdit.name,
      description: priceListToEdit.description ?? "",
      is_default: priceListToEdit.is_default,
      active: priceListToEdit.active,
      effective_date: priceListToEdit.effective_date,
    };
  }
  return {
    name: "",
    description: "",
    is_default: false,
    active: true,
    effective_date: "",
  };
};

const PriceListForm: React.FC<PriceListFormProps> = ({
  onCancel,
  isEditing,
  priceListToEdit,
  refreshPriceLists,
  class: classForm,
}) => {
  const {
    createPriceList,
    updatePriceList,
    selectedPriceListItems,
    fetchPriceListById,
  } = usePriceLists();

  // Para agregar/eliminar items
  const { addItem, removeItem } = usePriceListItems(priceListToEdit?.price_list_id || 0);

  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, priceListToEdit),
    [isEditing, priceListToEdit]
  );

  const form = useForm<CreatePriceListDTO>({
    defaultValues: initialValues,
  });

  const { products } = useProducts();

  // Cargar los items de la lista seleccionada al editar
  useEffect(() => {
    if (isEditing && priceListToEdit?.price_list_id) {
      fetchPriceListById(priceListToEdit.price_list_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, priceListToEdit?.price_list_id]);

  // Buscador de productos
  const handleSearchProducts = async (query: string) => {
    return products.filter(p =>
      (p.description ?? "")
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      (p.product_id?.toString() ?? "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  };

  // Agregar producto a la lista de precios
  const handleAddProduct = async (product: any, unit_price: number) => {
    if (!priceListToEdit) return;
    await addItem({
      price_list_id: priceListToEdit.price_list_id,
      product_id: product.product_id,
      unit_price,
    });
    // Refresca los items de la lista
    await fetchPriceListById(priceListToEdit.price_list_id);
  };

  // Eliminar producto de la lista de precios
  const handleRemoveProduct = async (item: any) => {
    await removeItem(item.price_list_item_id);
    // Refresca los items de la lista
    if (priceListToEdit) {
      await fetchPriceListById(priceListToEdit.price_list_id);
    }
  };

  const handleSubmit = async (values: CreatePriceListDTO | FormData) => {
    try {
      let success = false;
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      if (isEditing && priceListToEdit) {
        success = await updatePriceList(priceListToEdit.price_list_id, values);
      } else {
        success = await createPriceList(values);
      }
      if (success) {
        await refreshPriceLists();
        onCancel();
      } else {
        setError("Error al guardar la lista de precios");
      }
    } catch (err) {
      setError("Error al guardar la lista de precios");
      console.error(err);
    }
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <ItemForm<CreatePriceListDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={priceListFields}
        class={classForm}
      />
      {isEditing && priceListToEdit && (
        <div style={{
          marginTop: 24,
          padding: 30,
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #DDDDDD"
        }}>
        <AddItem<any, { unit_price: number }>
          title="Agregar producto a la lista"
          placeholder="Buscar producto..."
          onSearch={handleSearchProducts}
          onAdd={(product, data) => handleAddProduct(product, data.unit_price)}
          selectedItems={selectedPriceListItems.map(i => ({
            product_id: i.product?.product_id,
            description: i.product?.description,
            code: i.product?.code,
            image_url: i.product?.image_url,
          }))}
          renderItem={item => (
            <span>
              {item.description} ({item.code ?? item.product_id})
            </span>
          )}
          getKey={item => item.product_id}
          getDisplayValue={item => item.description}
          initialInputData={{ unit_price: 0 }}
          renderInputs={(data, setData) => (
            <>
              <p className="addItem-quantity-label">Precio</p>
              <input
                type="number"
                min={0}
                value={data.unit_price}
                onChange={e => setData({ ...data, unit_price: Number(e.target.value) })}
                className="addItem-quantity-input"
                placeholder="Precio"
              />
            </>
          )}
        />
          <ListItem
            items={selectedPriceListItems}
            columns={priceListItemListColumns}
            getKey={item => item.price_list_item_id}
            onRemove={handleRemoveProduct}
          />
        </div>
      )}
    </>
  );
};

export default PriceListForm;