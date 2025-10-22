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
import "../../styles/css/components/priceLists/priceListForm.css";
import { PriceListUpdatePrice } from "./PriceListUpdatePrice";
import { PriceListItemUpdatePrice } from "./PriceListItemUpdatePrice";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { formatDateForInput } from "../../utils/formatDateForInput";
import ModalActionConfirm from "../common/ModalActionConfirm";

interface PriceListFormProps {
  onCancel: () => void;
  isEditing: boolean;
  priceListToEdit?: PriceList | null;
  refreshPriceLists: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
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
      effective_date: formatDateForInput(priceListToEdit.effective_date),
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
  onSuccess,
}) => {
  const {
    createPriceList,
    updatePriceList,
    selectedPriceListItems,
    fetchPriceListById,
    fetchPriceListItemHistory,
    undoPriceUpdate, 
  } = usePriceLists();


  const { showSnackbar } = useSnackbar();

  const { addItem, removeItem } = usePriceListItems(priceListToEdit?.price_list_id || 0);
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false); // Estado para el modal de edición
  const [itemToEdit, setItemToEdit] = useState<any | null>(null); // Ítem seleccionado para editar
  const [error, setError] = useState<string | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreatePriceListDTO | null>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false); // NUEVO
  const [itemToUndo, setItemToUndo] = useState<any | null>(null);


  const initialValues = useMemo(
    () => getInitialValues(isEditing, priceListToEdit),
    [isEditing, priceListToEdit]
  );

  const form = useForm<CreatePriceListDTO>({
    defaultValues: initialValues,
  });

  const { products } = useProducts();

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
    await fetchPriceListById(priceListToEdit.price_list_id);
  };

  // Eliminar producto de la lista de precios
  const handleRemoveProduct = async (item: any) => {
    await removeItem(item.price_list_item_id);
    if (priceListToEdit) {
      await fetchPriceListById(priceListToEdit.price_list_id);
    }
  };

  // Editar producto en la lista de precios
  const handleEditProduct = (item: any) => {
    setItemToEdit(item);
    setShowEditItemModal(true);
  };

  const handleUndoItem = (item: any) => {
    setItemToUndo(item);
    setShowUndoConfirm(true);
  };

  // Confirma y ejecuta el deshacer
  const handleConfirmUndoItem = async () => {
    try {
      const item = itemToUndo;
      if (!item?.price_list_item_id) {
        showSnackbar("Ítem inválido para deshacer.", "error");
        return;
      }

      const res = await fetchPriceListItemHistory(item.price_list_item_id, { page: 1, limit: 1 });
      const history = res?.data || [];

      if (!history.length) {
        showSnackbar("No hay cambios para deshacer en este ítem.", "info");
        return;
      }

      let latest = history[0];
      if (history.length > 1) {
        latest = [...history].sort((a: any, b: any) =>
          new Date(b.change_date).getTime() - new Date(a.change_date).getTime()
        )[0] || history[0];
      }

      const createdBy =
        (typeof window !== "undefined" && (localStorage.getItem("userEmail") || localStorage.getItem("email"))) ||
        "admin@aguaviva.com";

      const undoRes = await undoPriceUpdate({
        history_ids: [latest.history_id],
        reason: "Deshacer último cambio de precio del ítem",
        created_by: createdBy,
      });

      if (undoRes) {
        showSnackbar(undoRes.message || "Actualización deshecha correctamente.", "success");
        if (priceListToEdit?.price_list_id) {
          await fetchPriceListById(priceListToEdit.price_list_id);
        }
      }
    } catch (err: any) {
      showSnackbar(err?.message || "Error al deshacer el cambio de precio", "error");
      console.error(err);
    } finally {
      setShowUndoConfirm(false);
      setItemToUndo(null);
    }
  };

  // Submit handler
  const handleSubmit = async (values: CreatePriceListDTO | FormData) => {
    try {
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      if (isEditing && priceListToEdit) {
        setPendingValues(values);
        setShowUpdateConfirm(true);
        return;
      }
      const success = await createPriceList(values);
      if (success) {
        await refreshPriceLists();
        if (onSuccess) onSuccess("Lista de precios creada correctamente.");
        showSnackbar("Lista de precios creada correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar la lista de precios");
        showSnackbar("Error al guardar la lista de precios", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar la lista de precios");
      showSnackbar(err?.message || "Error al guardar la lista de precios", "error");
      console.error(err);
    }
  };

  // Confirmación de edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !priceListToEdit) return;
    try {
      const success = await updatePriceList(priceListToEdit.price_list_id, pendingValues);
      if (success) {
        await refreshPriceLists();
        if (onSuccess) onSuccess("Lista de precios editada correctamente.");
        showSnackbar("Lista de precios editada correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar la lista de precios");
        showSnackbar("Error al actualizar la lista de precios", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar la lista de precios");
      showSnackbar(err?.message || "Error al actualizar la lista de precios", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<CreatePriceListDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={priceListFields}
        class={classForm}
      />
      {error && <div className="error-message">{error}</div>}
      {isEditing && priceListToEdit && (
        <div style={{
          marginTop: 24,
          padding: 30,
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #DDDDDD"
        }}>
        <div className="priceListForm-actions-container">
          <AddItem<any, { unit_price: number }>
            title="Agregar artículo a la lista"
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

          <button
            type="button"
            className="priceListForm-update-prices-btn"
            onClick={() => setShowUpdatePriceModal(true)}
          >
            Modificar todos los precios
          </button>
          <PriceListUpdatePrice
            isOpen={showUpdatePriceModal}
            onClose={() => setShowUpdatePriceModal(false)}
            priceListId={priceListToEdit.price_list_id}
            classForm={classForm}
            onUpdated={refreshPriceLists}
          />

        </div>
          <ListItem
            items={selectedPriceListItems}
            columns={priceListItemListColumns}
            getKey={item => item.price_list_item_id}
            onRemove={handleRemoveProduct}
            onEdit={handleEditProduct}
            onUndoAction={handleUndoItem} 
            content="Producto"
            genere="M"
          />
        </div>

      )}
      <PriceListItemUpdatePrice
        isOpen={showEditItemModal}
        onClose={() => setShowEditItemModal(false)}
        item={itemToEdit}
        classForm={classForm}
        onUpdated={async () => {
          await fetchPriceListById(priceListToEdit?.price_list_id || 0);
          showSnackbar("Precio del ítem actualizado correctamente.", "success");
        }}
      />
      <ModalActionConfirm
        isOpen={showUndoConfirm}
        onClose={() => {
          setShowUndoConfirm(false);
          setItemToUndo(null);
        }}
        onConfirm={handleConfirmUndoItem}
        content="deshacer el precio actual"
      />
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="lista de precios"
        genere="F"
      />
    </>
  );
};

export default PriceListForm;