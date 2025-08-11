import React, { useState } from "react";
import useProductCategories from "../../hooks/useProductCategories";
import { productCategoryColumns } from "../../config/products/productCategoryFieldsConfig";
import { DataTable } from "../../components/common/DataTable";
import ProductCategoryForm from "../../components/products/ProductCategoryForm";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import { Modal } from "../common/Modal";
import "../../styles/css/components/products/modalCategories.css";

interface ModalCategoriesProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalCategories: React.FC<ModalCategoriesProps> = ({ isOpen, onClose }) => {
  const {
    categories,
    deleteCategory,
    isLoading,
    error,
    fetchCategories,
  } = useProductCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const { showSnackbar } = useSnackbar();

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

    const handleDelete = (id: number) => {
    const original = categories.find(cat => cat.category_id === id);
    setCategoryToDelete(original || null);
    setShowDeleteModal(true);
    };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.category_id);
        showSnackbar("Categoría eliminada correctamente.", "success");
        fetchCategories();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar categoría", "error");
      } finally {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Categorías de Productos">
      <div className="modalCategories-container">
        <button
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="modalCategories-add-category-button"
        >
          Agregar Categoría
        </button>
        {showForm && (
          <ProductCategoryForm
            onCancel={() => setShowForm(false)}
            isEditing={!!editingCategory}
            categoryToEdit={editingCategory}
            refreshCategories={fetchCategories}
          />
        )}
        <DataTable
          data={categories.map(cat => ({ ...cat, id: cat.category_id }))}
          columns={productCategoryColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ModalDeleteConfirm
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleConfirmDelete}
          content="categoría"
          genere="F"
        />
        {error && <div className="error-message">{error}</div>}
        {isLoading && <div>Cargando...</div>}
      </div>
    </Modal>
  );
};

export default ModalCategories;