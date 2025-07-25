import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import useDeliveries from '../../hooks/useDeliveries';
import { deliveryColumns } from "../../config/deliveries/deliveryFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { deliveryFilters } from "../../config/deliveries/deliveryFilterConfig";
import { deliveryModalConfig } from "../../config/deliveries/deliveryModalConfig";
import '../../styles/css/pages/pages.css';
import PaginationControls from "../../components/common/PaginationControls";
import { useSnackbar } from "../../context/SnackbarContext";

const DeliveriesPage: React.FC = () => {
  const {
    deliveries,
    selectedDelivery,
    setSelectedDelivery,
    isLoading,
    error,
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
    fetchDeliveries,
  } = useDeliveries();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [deliveries]);

  const handleViewClick = (delivery: any) => {
    setSelectedDelivery(delivery);
    setShowViewModal(true);
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

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  const start = (page - 1) * (deliveries.length || 1) + (deliveries.length > 0 ? 1 : 0);
  const end = (page - 1) * (deliveries.length || 1) + deliveries.length;

  const titlePage = "deliveries";

  return (
    <div className={`page-container ${titlePage+"-page-container"}`}>
      {/* Panel de la tabla */}
      <div className={`page-content ${titlePage+"-page-content"}`}>
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Entregas</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar entregas..."
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
            <button
              onClick={() => {/* lógica para generar hoja de ruta */}}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Generar hoja de ruta"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Generar hoja de ruta
            </button>
          </div>
        </div>
        <DataTable
          data={deliveries.map(d => ({ ...d, id: d.order_id }))}
          columns={deliveryColumns}
          onView={handleViewClick}
          // No pasar onEdit ni onDelete para que solo se pueda ver
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
          label="entregas"
          className={titlePage+"-page-pagination"}
        />
      </div>

      {/* Modal de Vista */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDelivery(null);
        }}
        title="Detalles de la Entrega"
        class={titlePage}
        config={deliveryModalConfig}
        data={selectedDelivery}
      />

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={deliveryFilters}
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default DeliveriesPage;