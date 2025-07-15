import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { SubscriptionPlan } from '../../interfaces/SubscriptionPlan';
import useSubscriptionPlans from '../../hooks/useSubscriptionPlans';
import SubscriptionPlanForm from '../../components/subscriptionPlans/SubscriptionPlanForm';
import { useNavigate } from "react-router-dom";
import { subscriptionPlanColumns } from "../../config/subscriptionPlans/subscriptionPlanFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { subscriptionPlanFilters } from "../../config/subscriptionPlans/subscriptionPlanFiltersConfig";
import { subscriptionPlanModalConfig } from "../../config/subscriptionPlans/subscriptionPlanModalConfig";
import ModalDelete from "../../components/common/ModalDelete";
import '../../styles/css/pages/pages.css';
import SubscriptionPlanUpdatePrice from "../../components/subscriptionPlans/SubscriptionPlanUpdatePrice";
import "../../styles/css/pages/subscriptionPlans/subscriptionPlansPage.css";

const SubscriptionPlansPage: React.FC = () => {
  const {
    plans,
    selectedPlan,
    setSelectedPlan,
    handleDelete,
    isLoading,
    error,
    refreshPlans,
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
  } = useSubscriptionPlans();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [plans]);

  const handleDeleteClick = (id: number) => {
    const plan = plans.find(p => p.subscription_plan_id === id);
    setPlanToDelete(plan || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await handleDelete(planToDelete.subscription_plan_id);
      setShowDeleteModal(false);
      setPlanToDelete(null);
    }
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedPlan(null);
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

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  const start = (page - 1) * (plans.length || 1) + (plans.length > 0 ? 1 : 0);
  const end = (page - 1) * (plans.length || 1) + plans.length;

  const titlePage = "subscriptionPlans";

  return (
    <div className={`page-container ${titlePage+"-page-container"}`}>
      {/* Panel de la tabla */}
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Abonos</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar abonos..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage+"-page-header-div-2"}`}>
            <button
              type="button"
              className="subscriptionPlans-update-prices-btn"
              onClick={() => setShowUpdatePriceModal(true)}
            >
              Modificar precios
            </button>
            <SubscriptionPlanUpdatePrice
              isOpen={showUpdatePriceModal}
              onClose={() => setShowUpdatePriceModal(false)}
              onUpdated={refreshPlans}
              classForm={titlePage}
            />
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
              onClick={() => navigate("/abonos/nuevo-abono")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nuevo abono"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nuevo Abono
            </button>
          </div>
        </div>
        <DataTable
          data={plans.map(p => ({ ...p, id: p.subscription_plan_id }))}
          columns={subscriptionPlanColumns}
          onView={(plan) => {
            setSelectedPlan(plan);
            setShowViewModal(true);
          }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          class={titlePage}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        {/* Controles de paginación y leyenda */}
        <div className={`page-pagination ${titlePage+"-page-pagination"}`}>
          <div className={`page-pagination-legend ${titlePage+"-page-pagination-legend"}`}>
            Mostrando {end > total ? total : end} de {total} abonos
          </div>
          <div className={`page-pagination-controls ${titlePage+"-page-pagination-controls"}`}>
            <button
              className={`page-pagination-botton-prev ${titlePage+"-page-pagination-botton-prev"}`}
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`${page === i + 1 ? 'bg-[#403A92] text-white' : 'bg-[#FFFFFF] hover:bg-gray-300'} page-pagination-button ${titlePage+"-page-pagination-button"}`}
                onClick={() => setPage(i + 1)}
                disabled={page === i + 1}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={`page-pagination-button-next ${titlePage+"-page-pagination-button-next"}`}
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
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
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Abono</h2>
          </div>
          {selectedPlan && (
            <SubscriptionPlanForm
              onCancel={handleCloseForm}
              isEditing={!!selectedPlan}
              planToEdit={selectedPlan}
              refreshPlans={async () => { await refreshPlans(); }}
              class={titlePage}
            />
          )}
        </div>
      </div>

      {/* Modal de Vista */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPlan(null);
        }}
        title="Detalles del Abono"
        class={titlePage}
        config={subscriptionPlanModalConfig}
        data={selectedPlan}
      />

      {/* Modal de Eliminar */}
      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="abono"
        genere="M"
      />

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={subscriptionPlanFilters}
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default SubscriptionPlansPage;