import React, { useState } from "react";
import { CreateProductDTO, Product } from "../../interfaces/Product";
import { Field } from "../../components/common/ItemForm";
import { productFields } from "../../config/products/productFieldsConfig";
import useProducts from "../../hooks/useProducts";
import {ItemForm} from "../../components/common/ItemForm";

interface ProductFormProps {
  onCancel: () => void;
  isEditing: boolean;
  productToEdit?: Product | null;
  refreshProducts: () => void;
  class?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onCancel,
  isEditing,
  productToEdit,
  refreshProducts,
  class: classForm,
}) => {
  const { createProduct, updateProduct } = useProducts();
  const [error, setError] = useState<string | null>(null);

  // Inicializa los valores del formulario
  const initialValues: CreateProductDTO = isEditing && productToEdit
    ? {
        category_id: productToEdit.product_category.category_id,
        description: productToEdit.description,
        volume_liters: productToEdit.volume_liters,
        price: productToEdit.price,
        is_returnable: productToEdit.is_returnable,
        serial_number: productToEdit.serial_number,
        notes: productToEdit.notes,
        productImage: null, // No se rellena la imagen en edición
      }
    : {
        category_id: 0,
        description: "",
        volume_liters: 0,
        price: 0,
        is_returnable: false,
        serial_number: "",
        notes: "",
        productImage: null,
      };

  // Manejo de submit
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
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      fields={productFields}
      class={classForm}
    />
  );
};

export default ProductForm;