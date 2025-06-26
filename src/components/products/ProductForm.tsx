import React, { useEffect, useState, useMemo } from "react";
import { CreateProductDTO, Product } from "../../interfaces/Product";
import { ProductService } from "../../services/ProductService";
import { ItemForm } from "../../components/common/ItemForm";
import { productFields } from "../../config/products/productFieldsConfig";
import useProducts from "../../hooks/useProducts";
import { useForm } from "react-hook-form";

interface ProductFormProps {
  onCancel: () => void;
  isEditing: boolean;
  productToEdit?: Product | null;
  refreshProducts: () => void;
  class?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onCancel,
  isEditing,
  productToEdit,
  refreshProducts,
  class: classForm,
}) => {
  const { createProduct, updateProduct } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);

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
          total_stock: productToEdit.total_stock, // <-- agregado
          productImage: null,
        }
      : {
          category_id: 0,
          description: "",
          volume_liters: 0,
          price: 0,
          is_returnable: false,
          serial_number: "",
          notes: "",
          total_stock: 0, // <-- agregado
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
        success = await updateProduct(productToEdit.product_id, dataToSend, dataToSend instanceof FormData);
      } else {
        success = await createProduct(dataToSend, dataToSend instanceof FormData);
      }

      if (success) {
        await refreshProducts();
        onCancel();
      }
    } catch (err) {
      setError("Error al guardar el artículo");
      console.error(err);
    }
  };

  return (
    <ItemForm<CreateProductDTO>
      {...form}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      fields={productFields(categories, isEditing ? productToEdit?.product_category.category_id : undefined)}
      class={classForm}
    />
  );
};