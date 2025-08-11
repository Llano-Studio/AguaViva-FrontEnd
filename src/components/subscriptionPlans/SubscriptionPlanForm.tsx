import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateSubscriptionPlanDTO, SubscriptionPlan, SubscriptionPlanProduct } from "../../interfaces/SubscriptionPlan";
import { ItemForm } from "../common/ItemForm";
import { subscriptionPlanFields } from "../../config/subscriptionPlans/subscriptionPlanFieldsConfig";
import useSubscriptionPlans from "../../hooks/useSubscriptionPlans";
import useProducts from "../../hooks/useProducts";
import { AddItem } from "../common/AddItem";
import { ListItem } from "../common/ListItem";
import { useSubscriptionPlanProducts } from "../../hooks/useSubscriptionPlanProducts";
import { subscriptionPlanProductListColumns } from "../../config/subscriptionPlans/subscriptionPlanProductListColumns";
import { ProductService } from "../../services/ProductService";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";

interface SubscriptionPlanFormProps {
  onCancel: () => void;
  isEditing: boolean;
  planToEdit?: SubscriptionPlan | null;
  refreshPlans: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (
  isEditing: boolean,
  planToEdit?: SubscriptionPlan | null
): CreateSubscriptionPlanDTO => {
  if (isEditing && planToEdit) {
    return {
      name: planToEdit.name,
      description: planToEdit.description,
      price: planToEdit.price,
      default_cycle_days: planToEdit.default_cycle_days,
      default_deliveries_per_cycle: planToEdit.default_deliveries_per_cycle,
      is_active: planToEdit.is_active,
    };
  }
  return {
    name: "",
    description: "",
    price: 0,
    default_cycle_days: 30,
    default_deliveries_per_cycle: 1,
    is_active: true,
  };
};

const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({
  onCancel,
  isEditing,
  planToEdit,
  refreshPlans,
  class: classForm,
  onSuccess,
}) => {
  const { createSubscriptionPlan, updateSubscriptionPlan } = useSubscriptionPlans();
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateSubscriptionPlanDTO | null>(null);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, planToEdit),
    [isEditing, planToEdit]
  );

  const form = useForm<CreateSubscriptionPlanDTO>({
    defaultValues: initialValues,
  });

  // --- Productos asociados ---
  const { products } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<SubscriptionPlanProduct[]>(planToEdit?.products || []);
  const { addProduct, removeProduct, loading: loadingProducts } = useSubscriptionPlanProducts(planToEdit?.subscription_plan_id || 0);

  // Servicio para obtener imágenes de productos
  const productService = new ProductService();
  const [productImages, setProductImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const images: Record<number, string> = {};
      await Promise.all(
        selectedProducts.map(async (item) => {
          if (!productImages[item.product_id]) {
            const product = await productService.getProductById(item.product_id);
            if (product && product.image_url) {
              images[item.product_id] = product.image_url;
            }
          } else {
            images[item.product_id] = productImages[item.product_id];
          }
        })
      );
      setProductImages((prev) => ({ ...prev, ...images }));
    };
    if (selectedProducts.length > 0) fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducts]);

  // Buscador de productos
  const handleSearchProducts = async (query: string) => {
    return products.filter(p =>
      String("product_description" in p ? p.product_description : p.description)
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      String("product_code" in p ? p.product_code : p.product_id?.toString() ?? "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  };

  // Añadir producto al abono
  const handleAddProduct = async (product: any, quantity: number) => {
    if (!planToEdit) return;
    const exists = selectedProducts.some(p => p.product_id === product.product_id);
    if (!exists) {
      const res = await addProduct({ product_id: product.product_id, product_quantity: quantity });
      if (res) setSelectedProducts(res.products);
    }
  };

  // Quitar producto del abono
  const handleRemoveProduct = async (product: SubscriptionPlanProduct) => {
    if (!planToEdit) return;
    const res = await removeProduct(product.product_id);
    if (res) setSelectedProducts(res.products);
  };

  const handleSubmit = async (values: CreateSubscriptionPlanDTO | FormData) => {
    try {
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      if (isEditing && planToEdit) {
        setPendingValues(values);
        setShowUpdateConfirm(true);
        return;
      }
      const success = await createSubscriptionPlan(values);
      if (success) {
        await refreshPlans();
        if (onSuccess) onSuccess("Abono creado correctamente.");
        showSnackbar("Abono creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el abono");
        showSnackbar("Error al guardar el abono", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el abono");
      showSnackbar(err?.message || "Error al guardar el abono", "error");
      console.error(err);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingValues || !planToEdit) return;
    try {
      const success = await updateSubscriptionPlan(planToEdit.subscription_plan_id, pendingValues);
      if (success) {
        await refreshPlans();
        if (onSuccess) onSuccess("Abono editado correctamente.");
        showSnackbar("Abono editado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar el abono");
        showSnackbar("Error al actualizar el abono", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el abono");
      showSnackbar(err?.message || "Error al actualizar el abono", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  const selectedProductsWithImages = selectedProducts.map(item => ({
    ...item,
    image_url: productImages[item.product_id], // puede ser undefined si no hay imagen
  }));

  // Render condicional para soportar Product y SubscriptionPlanProduct
  const renderProductItem = (item: any) => (
    <span>
      {("product_description" in item ? item.product_description : item.description)}
      {" "}
      (
      {("product_code" in item ? item.product_code : item.product_id)}
      )
      {item.quantity !== undefined && ` - Cantidad: ${item.quantity}`}
    </span>
  );

  return (
    <>
      <ItemForm<CreateSubscriptionPlanDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={subscriptionPlanFields}
        class={classForm}
      />
      {error && <div className="error-message">{error}</div>}
      {isEditing && (
        <div style={{
          marginTop: 24,
          padding: 30,
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #DDDDDD"
        }}>
          <AddItem<any>
            title="Articulos del abono"
            placeholder="Buscar producto..."
            onSearch={handleSearchProducts}
            onAdd={(product, quantity) => handleAddProduct(product, quantity)}
            selectedItems={selectedProducts}
            renderItem={renderProductItem}
            getKey={item => item.product_id || item.id}
            getDisplayValue={item =>
              "product_description" in item
                ? item.product_description
                : item.description
            }
          />
          <ListItem
            items={selectedProductsWithImages}
            columns={subscriptionPlanProductListColumns}
            getKey={item => item.product_id}
            onRemove={handleRemoveProduct}
            content="producto"
            genere="M"
          />
        </div>
      )}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="abono"
        genere="M"
      />
    </>
  );
};

export default SubscriptionPlanForm;