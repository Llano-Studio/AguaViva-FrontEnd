import React, { useEffect, useState, useMemo } from "react";
import { CreateProductDTO, Product } from "../../interfaces/Product";
import { ProductService } from "../../services/ProductService";
import { ItemForm } from "../../components/common/ItemForm";
import { productFields } from "../../config/products/productFieldsConfig";
import useProducts from "../../hooks/useProducts";
import { useForm } from "react-hook-form";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";

interface ProductFormProps {
  onCancel: () => void;
  isEditing: boolean;
  productToEdit?: Product | null;
  refreshProducts: () => void;
  class?: string;
  onSuccess?: (msg: string) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onCancel,
  isEditing,
  productToEdit,
  refreshProducts,
  class: classForm,
  onSuccess,
}) => {
  const { createProduct, updateProduct } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const { showSnackbar } = useSnackbar();

  // Modal de confirmación de edición
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateProductDTO | FormData | null>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      const service = new ProductService();
      const cats = await service.getCategories();
      setCategories(cats.map(c => ({ label: c.name, value: c.category_id })));
    };
    fetchCategories();
  }, []);

  // Memoiza los valores iniciales para evitar recrear el formulario en cada render
  const initialValues: CreateProductDTO = useMemo(() => (
    isEditing && productToEdit
      ? {
          category_id: productToEdit.product_category.category_id,
          description: productToEdit.description,
          volume_liters: productToEdit.volume_liters,
          price: productToEdit.price,
          is_returnable: productToEdit.is_returnable,
          serial_number: productToEdit.serial_number,
          notes: productToEdit.notes,
          total_stock: productToEdit.total_stock,
          productImage: productToEdit.image_url,
        }
      : {
          category_id: 0,
          description: "",
          volume_liters: 0,
          price: 0,
          is_returnable: false,
          serial_number: "",
          notes: "",
          total_stock: 0,
          productImage: null,
        }
  ), [isEditing, productToEdit]);


  // React Hook Form
  const form = useForm<CreateProductDTO>({
    defaultValues: initialValues,
  });

  // Submit handler
  const handleSubmit = async (values: CreateProductDTO | FormData) => {
    try {
      let success = false;
      let dataToSend: any;

      if (values instanceof FormData) {
        dataToSend = values;
      } else {
        // Si hay imagen, usar FormData
        if (values.productImage) {
          dataToSend = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (key === "productImage" && value) {
              dataToSend.append(key, value as File);
            } else {
              dataToSend.append(key, value as any);
            }
          });
        } else {
          dataToSend = values;
        }
      }

      if (isEditing && productToEdit) {
        setPendingValues(dataToSend);
        setShowUpdateConfirm(true);
        return;
      } else {
        success = await createProduct(dataToSend, dataToSend instanceof FormData);
      }

      if (success) {
        await refreshProducts();
        if (onSuccess) onSuccess("Artículo creado correctamente.");
        showSnackbar("Artículo creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el artículo");
        showSnackbar("Error al guardar el artículo", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el artículo");
      showSnackbar(err?.message || "Error al guardar el artículo", "error");
      console.error(err);
    }
  };

  // Confirmación de edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !productToEdit) return;
    try {
      let dataToSend: FormData | Partial<Product>;
      if (pendingValues instanceof FormData) {
        dataToSend = pendingValues;
      } else {
        // Elimina productImage del objeto para cumplir con Partial<Product>
        const { productImage, ...rest } = pendingValues;
        dataToSend = rest; // No casteo, TypeScript lo infiere
      }

      const success = await updateProduct(
        productToEdit.product_id,
        dataToSend,
        dataToSend instanceof FormData
      );
      if (success) {
        await refreshProducts();
        if (onSuccess) onSuccess("Artículo editado correctamente.");
        showSnackbar("Artículo editado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al actualizar el artículo");
        showSnackbar("Error al actualizar el artículo", "error");
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el artículo");
      showSnackbar(err?.message || "Error al actualizar el artículo", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<CreateProductDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={productFields(categories, isEditing ? productToEdit?.product_category.category_id : undefined)}
        class={classForm}
      />
      {error && <div className="error-message">{error}</div>}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="artículo"
        genere="M"
      />
    </>
  );
};