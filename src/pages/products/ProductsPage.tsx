import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Product } from '../../interfaces/Product';
import useProducts from '../../hooks/useProducts';
import { ProductForm } from '../../components/products/ProductForm';
import { useNavigate } from "react-router-dom";
import { productColumns } from "../../config/products/productFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { productFilters } from "../../config/products/productFiltersConfig";
import { productModalConfig } from "../../config/products/productModalConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import '../../styles/css/pages/pages.css';
import PaginationControls from "../../components/common/PaginationControls";
import ModalCategories from "../../components/products/ModalCategories";
import useProductCategories from "../../hooks/useProductCategories";


const ProductsPage: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    deleteProduct,
    isLoading,
    error,
    refreshProducts,
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection
  } = useProducts();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { categories, fetchCategories } = useProductCategories();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [products]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (id: number) => {
    const product = products.find(p => p.product_id === id);
    setProductToDelete(product || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.product_id);
        showSnackbar("Artículo eliminado correctamente.", "success");
        refreshProducts();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar artículo", "error");
      } finally {
        setShowDeleteModal(false);
        setProductToDelete(null);
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedProduct(null);
    setShowForm(false);
  };

  // Filtros
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setShowFilters(false);
    setPage(1);
  };

  // Multi-sort handler
  const handleSort = (column: string) => {
    const idx = sortBy.indexOf(column);
    if (idx === -1) {
      setSortBy([...sortBy, column]);
      setSortDirection([...sortDirection, "asc"]);
    } else if (sortDirection[idx] === "asc") {
      const newDirections = [...sortDirection];
      newDirections[idx] = "desc";
      setSortDirection(newDirections);
    } else if (sortDirection[idx] === "desc") {
      setSortBy(sortBy.filter((_, i) => i !== idx));
      setSortDirection(sortDirection.filter((_, i) => i !== idx));
    }
    setPage(1);
  };


  const dynamicProductFilters = productFilters.map((filter) => {
    if (filter.name === "categoryIds") {
      return {
        ...filter,
        options: categories.map((category) => ({
          label: category.name,
          value: category.category_id.toString(),
        })),
      };
    }
    return filter;
  });

  // Maneja el éxito en crear/editar producto
  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    setShowForm(false);
    setSelectedProduct(null);
    refreshProducts();
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  const start = (page - 1) * (products.length || 1) + (products.length > 0 ? 1 : 0);
  const end = (page - 1) * (products.length || 1) + products.length;

  const titlePage = "products";

  return (
    <div className={`table-scroll page-container ${titlePage+"-page-container"}`}>
      {/* Panel de la tabla */}
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Artículos</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar artículos..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage+"-page-header-div-2"}`}>
            <button
              onClick={() => setShowCategoriesModal(true)}
              className={`page-action-button ${titlePage}-page-action-button`}
            >
              Categorías
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className={`page-filter-button ${titlePage+"-page-filter-button"}`}
            >
              <img
                src="/assets/icons/filter-icon.svg"
                alt="Filtros"
                className={`page-filter-button-icon ${titlePage+"-page-filter-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Filtros
            </button>
            <button
              onClick={() => navigate("/articulos/nuevo-articulo")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nuevo artículo"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nuevo Artículo
            </button>
          </div>
        </div>
        <DataTable
          data={products.map(p => ({ ...p, id: p.product_id }))}
          columns={productColumns}
          onView={(product) => {
            setSelectedProduct(product);
            setShowViewModal(true);
          }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          class={titlePage}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          start={start}
          end={end}
          total={total}
          label="artículos"
          className={titlePage+"-page-pagination"}
        />
      </div>

      {/* Panel del formulario */}
      <div
        className={`form-container ${titlePage+"-form-container"}
          ${showForm ? "translate-x-0" : "translate-x-full"}
        `}>
        <div className={`form-wrapper ${titlePage+"-form-wrapper"}`}>
          <div className={`form-header ${titlePage+"-form-header"}`}>
            <button
              onClick={handleCloseForm}
              className={`form-close-button ${titlePage+"-form-close-button"}`}>
              <img src="/assets/icons/back.svg" alt="Volver" className={`form-icon-cancel ${titlePage+"-form-icon-cancel"}`} />
            </button>
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Artículo</h2>
          </div>
          {selectedProduct && (
            <ProductForm
              onCancel={handleCloseForm}
              isEditing={!!selectedProduct}
              productToEdit={selectedProduct}
              refreshProducts={refreshProducts}
              class={titlePage}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      </div>

      {/* Modal de Vista */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduct(null);
        }}
        title="Detalles del Artículo"
        class={titlePage}
        config={productModalConfig}
        data={selectedProduct}
      />

      {/* Modal de Eliminar */}
      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="artículo"
        genere="M"
      />

      {/* Modal de Categorías */}
      <ModalCategories
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
      />

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={dynamicProductFilters} // Usar filtros dinámicos
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default ProductsPage;