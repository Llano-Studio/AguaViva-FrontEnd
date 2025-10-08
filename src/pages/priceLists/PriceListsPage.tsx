import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { PriceList } from "../../interfaces/PriceList";
import { usePriceLists } from "../../hooks/usePriceLists";
import PriceListForm from "../../components/priceLists/PriceListForm";
import { useNavigate } from "react-router-dom";
import { priceListColumns } from "../../config/priceLists/priceListFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { priceListFilters } from "../../config/priceLists/priceListFiltersConfig";
import { priceListModalConfig } from "../../config/priceLists/priceListModalConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import PaginationControls from "../../components/common/PaginationControls";
import { buildIsRole } from "../../utils/buildIsRole";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../interfaces/User";
import "../../styles/css/pages/pages.css";
import SpinnerLoading from "../../components/common/SpinnerLoading";

const PriceListsPage: React.FC = () => {
  const {
    priceLists,
    selectedPriceList,
    setSelectedPriceList,
    deletePriceList,
    isLoading,
    error,
    refreshPriceLists,
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
    setSortDirection,
  } = usePriceLists();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [priceListToDelete, setPriceListToDelete] = useState<PriceList | null>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showSnackbar } = useSnackbar();
  const { currentUser } = useAuth();
  const isRole = buildIsRole(currentUser?.role as UserRole | undefined);
  const canDelete = isRole.SUPERADMIN || isRole.BOSSADMINISTRATIVE;
  const canEdit = isRole.SUPERADMIN || isRole.BOSSADMINISTRATIVE;
  const canCreate = isRole.SUPERADMIN || isRole.BOSSADMINISTRATIVE;


  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [priceLists]);

  const handleDeleteClick = (id: number) => {
    const priceList = priceLists.find(p => p.price_list_id === id);
    setPriceListToDelete(priceList || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (priceListToDelete) {
      try {
        await deletePriceList(priceListToDelete.price_list_id);
        showSnackbar("Lista de precios eliminada correctamente.", "success");
        await refreshPriceLists();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar lista de precios", "error");
      } finally {
        setShowDeleteModal(false);
        setPriceListToDelete(null);
      }
    }
  };

  const handleEditClick = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedPriceList(null);
    setShowForm(false);
  };

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

  // Maneja el éxito en crear/editar lista de precios
  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    setShowForm(false);
    setSelectedPriceList(null);
    refreshPriceLists();
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4 container-loading"><SpinnerLoading /></div>;
  }

  const start = (page - 1) * (priceLists.length || 1) + (priceLists.length > 0 ? 1 : 0);
  const end = (page - 1) * (priceLists.length || 1) + priceLists.length;

  const titlePage = "priceLists";

  return (
    <div className={`table-scroll page-container ${titlePage+"-page-container"}`}>
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Listas de Precios</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar listas de precios..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage+"-page-header-div-2"}`}>
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
            {canCreate && (
            <button
              onClick={() => navigate("/listas-precios/nueva-lista-precios")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nueva lista"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nueva Lista
            </button>
            )}
          </div>
        </div>
        <DataTable
          data={priceLists.map(p => ({ ...p, id: p.price_list_id }))}
          columns={priceListColumns}
          onView={(priceList) => {
            setSelectedPriceList(priceList);
            setShowViewModal(true);
          }}
          onEdit={canEdit ? handleEditClick : undefined}
          onDelete={canDelete ? handleDeleteClick : undefined}
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
          label="listas de precios"
          className={titlePage+"-page-pagination"}
        />
      </div>

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
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Lista de Precios</h2>
          </div>
          {selectedPriceList && (
            <PriceListForm
              onCancel={handleCloseForm}
              isEditing={!!selectedPriceList}
              priceListToEdit={selectedPriceList}
              refreshPriceLists={async () => { await refreshPriceLists(); }}
              class={titlePage}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPriceList(null);
        }}
        title="Detalles de la Lista de Precios"
        class={titlePage}
        config={priceListModalConfig}
        data={selectedPriceList}
      />

      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="lista de precios"
        genere="F"
      />

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={priceListFilters}
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default PriceListsPage;