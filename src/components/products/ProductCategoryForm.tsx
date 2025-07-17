import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ItemForm } from "../common/ItemForm";
import { productCategoryFields } from "../../config/products/productCategoryFieldsConfig";
import { CreateProductCategoryDTO, ProductCategory } from "../../interfaces/ProductCategories";
import useProductCategories from "../../hooks/useProductCategories";
import { useSnackbar } from "../../context/SnackbarContext";

interface ProductCategoryFormProps {
  onCancel: () => void;
  isEditing: boolean;
  categoryToEdit?: ProductCategory | null;
  refreshCategories: () => void;
  onSuccess?: (msg: string) => void;
}

const ProductCategoryForm: React.FC<ProductCategoryFormProps> = ({
  onCancel,
  isEditing,
  categoryToEdit,
  refreshCategories,
  onSuccess,
}) => {
  const { createCategory, updateCategory } = useProductCategories();
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  // Memoiza los valores iniciales
  const initialValues: CreateProductCategoryDTO = useMemo(() =>
    isEditing && categoryToEdit
      ? { name: categoryToEdit.name }
      : { name: "" }
  , [isEditing, categoryToEdit]);

  // Usa useForm y pásale los valores iniciales
  const form = useForm<CreateProductCategoryDTO>({
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: CreateProductCategoryDTO | FormData) => {
    let data: CreateProductCategoryDTO;
    if (values instanceof FormData) {
      data = { name: values.get("name") as string };
    } else {
      data = values;
    }
    try {
      let success = false;
      if (isEditing && categoryToEdit) {
        await updateCategory(categoryToEdit.category_id, data.name);
        success = true;
      } else {
        await createCategory(data.name);
        success = true;
      }
      if (success) {
        await refreshCategories();
        if (onSuccess) onSuccess(isEditing ? "Categoría editada correctamente." : "Categoría creada correctamente.");
        showSnackbar(isEditing ? "Categoría editada correctamente." : "Categoría creada correctamente.", "success");
        onCancel();
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar la categoría");
      showSnackbar(err?.message || "Error al guardar la categoría", "error");
    }
  };

  return (
    <div style={{marginBottom: "20px"}}>
      <ItemForm<CreateProductCategoryDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={productCategoryFields}
      />
    </div>
  );
};

export default ProductCategoryForm;