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
import useRouteSheets from "../../hooks/useRouteSheets";
import { routeSheetColumns } from "../../config/routeSheets/routeSheetFieldsConfig";
import { routeSheetModalConfig } from "../../config/routeSheets/routeSheetModalConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { RouteSheetForm } from "../../components/routeSheets/RouteSheetForm";
import { CreateRouteSheetDTO, UpdateRouteSheetDTO } from "../../interfaces/RouteSheet";
import "../../styles/css/pages/deliveries/deliveriesPage.css";
import { useNavigate } from "react-router-dom";
import { downloadPDF } from "../../utils/downloadPDF";
import { BASE_URL } from "../../config";
import OrdersTable from "../../components/orders/OrdersTable";
import SpinnerLoading from '../../components/common/SpinnerLoading';

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
    limit,
  } = useDeliveries();

  const {
    routeSheets,
    selectedRouteSheet,
    setSelectedRouteSheet,
    isLoading: isLoadingRouteSheets,
    error: errorRouteSheets,
    page: routeSheetPage,
    setPage: setRouteSheetPage,
    totalPages: routeSheetTotalPages,
    total: routeSheetTotal,
    sortBy: routeSheetSortBy,
    setSortBy: setRouteSheetSortBy,
    sortDirection: routeSheetSortDirection,
    setSortDirection: setRouteSheetSortDirection,
    fetchRouteSheets,
    deleteRouteSheet,
    createRouteSheet,
    updateRouteSheet,
    printRouteSheet,
  } = useRouteSheets();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showRouteSheetModal, setShowRouteSheetModal] = useState(false);
  const [showRouteSheetForm, setShowRouteSheetForm] = useState(false);
  const [showDeleteRouteSheetModal, setShowDeleteRouteSheetModal] = useState(false);
  const [routeSheetToDelete, setRouteSheetToDelete] = useState<any>(null);

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    fetchRouteSheets();
    // eslint-disable-next-line
  }, []);

  const handleViewClick = (order: any) => {
    setSelectedDelivery(order);
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

  const handleViewRouteSheet = (routeSheet: any) => {
    setSelectedRouteSheet(routeSheet);
    setShowRouteSheetModal(true);
  };

  const handleEditRouteSheet = (routeSheet: any) => {
    setSelectedRouteSheet(routeSheet);
    setShowRouteSheetForm(true);
  };

  const handleDeleteRouteSheet = (id: number) => {
    const sheet = routeSheets.find(r => r.route_sheet_id === id);
    setRouteSheetToDelete(sheet || null);
    setShowDeleteRouteSheetModal(true);
  };

  const handleConfirmDeleteRouteSheet = async () => {
    if (!routeSheetToDelete) return;
    try {
      await deleteRouteSheet(routeSheetToDelete.route_sheet_id);
      showSnackbar("Hoja de ruta eliminada correctamente.", "success");
      await fetchRouteSheets();
    } catch (err: any) {
      showSnackbar(err?.message || "Error al eliminar hoja de ruta", "error");
    } finally {
      setShowDeleteRouteSheetModal(false);
      setRouteSheetToDelete(null);
    }
  };

  const handleCloseRouteSheetForm = () => {
    setSelectedRouteSheet(null);
    setShowRouteSheetForm(false);
  };

  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    setShowRouteSheetForm(false);
    setSelectedRouteSheet(null);
    fetchRouteSheets();
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

  const handleRouteSheetSort = (column: string) => {
    const idx = routeSheetSortBy.indexOf(column);
    if (idx === -1) {
      setRouteSheetSortBy([...routeSheetSortBy, column]);
      setRouteSheetSortDirection([...routeSheetSortDirection, "asc"]);
    } else if (routeSheetSortDirection[idx] === "asc") {
      const newDirections = [...routeSheetSortDirection];
      newDirections[idx] = "desc";
      setRouteSheetSortDirection(newDirections);
    } else if (routeSheetSortDirection[idx] === "desc") {
      setRouteSheetSortBy(routeSheetSortBy.filter((_, i) => i !== idx));
      setRouteSheetSortDirection(routeSheetSortDirection.filter((_, i) => i !== idx));
    }
    setRouteSheetPage(1);
  };

  const handleDownloadRouteSheet = async (routeSheet: any) => {
    try {
      const res = await printRouteSheet({
        route_sheet_id: routeSheet.route_sheet_id,
        format: "pdf",
        include_map: true,
        include_signature_field: true,
        include_product_details: true,
      });
    
      await downloadPDF({
        url: res.url,
        filename: res.filename,
        baseURL: BASE_URL,
        showLogs: false
      });

      showSnackbar("Hoja de ruta descargada correctamente", "success");
    } catch (err: any) {
      console.error("Error al descargar:", err);
      showSnackbar(err?.message || "Error al descargar hoja de ruta", "error");
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4 container-loading"><SpinnerLoading /></div>;
  }

  const start = total > 0 ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);

  const routeSheetStart = (routeSheetPage - 1) * (routeSheets.length || 1) + (routeSheets.length > 0 ? 1 : 0);
  const routeSheetEnd = (routeSheetPage - 1) * (routeSheets.length || 1) + routeSheets.length;

  const titlePage = "deliveries";

  return (
    <div className={`table-scroll page-container ${titlePage+"-page-container"}`}>
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
              onClick={() => navigate("/hojas-de-ruta/nueva-hoja-de-ruta")}
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

        {/* Tabla de pedidos (combinados por el hook) usando OrdersTable */}
        <OrdersTable
          orders={deliveries as any}
          className={titlePage}
          onView={handleViewClick as any}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          columns={deliveryColumns}
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
      
        {/* Panel de la tabla de hojas de ruta */}
        <div className="route-sheets-section-container">
          <h2 className="page-title">Hojas de Ruta</h2>
          {errorRouteSheets && <div className="text-red-500 p-2">{errorRouteSheets}</div>}
          <DataTable
            data={routeSheets.map(r => ({ ...r, id: r.route_sheet_id }))}
            columns={routeSheetColumns}
            onView={handleViewRouteSheet}
            onEdit={handleEditRouteSheet}
            onDelete={handleDeleteRouteSheet}
            onDownload={handleDownloadRouteSheet}
            class="route-sheets"
            sortBy={routeSheetSortBy}
            sortDirection={routeSheetSortDirection}
            onSort={handleRouteSheetSort}
          />
          <PaginationControls
            page={routeSheetPage}
            totalPages={routeSheetTotalPages}
            onPageChange={setRouteSheetPage}
            start={routeSheetStart}
            end={routeSheetEnd}
            total={routeSheetTotal}
            label="hojas de ruta"
            className="route-sheets-pagination"
          />
        </div>

        {/* Panel del formulario de hoja de ruta */}
        <div
          className={`form-container route-sheets-form-container
            ${showRouteSheetForm ? "translate-x-0" : "translate-x-full"}
          `}>
          <div className="form-wrapper route-sheets-form-wrapper">
            <div className="form-header route-sheets-form-header">
              <button
                onClick={handleCloseRouteSheetForm}
                className="form-close-button route-sheets-form-close-button">
                <img src="/assets/icons/back.svg" alt="Volver" className="form-icon-cancel route-sheets-form-icon-cancel" />
              </button>
              <h2 className="form-title route-sheets-form-title">
                {selectedRouteSheet ? "Editar hoja de ruta" : "Generar hoja de ruta"}
              </h2>
            </div>
            <RouteSheetForm
              onSubmit={selectedRouteSheet
                ? async (values: UpdateRouteSheetDTO) => {
                    await updateRouteSheet(selectedRouteSheet.route_sheet_id, values);
                    handleFormSuccess("Hoja de ruta editada correctamente.");
                  }
                : async (values: CreateRouteSheetDTO) => {
                    await createRouteSheet(values);
                    handleFormSuccess("Hoja de ruta creada correctamente.");
                  }
              }
              onCancel={handleCloseRouteSheetForm}
              isEditing={!!selectedRouteSheet}
              routeSheetToEdit={selectedRouteSheet}
              loading={isLoadingRouteSheets}
              error={errorRouteSheets}
              className="route-sheet-form"
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
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

      {/* Modal de Vista de hoja de ruta */}
      <Modal
        isOpen={showRouteSheetModal}
        onClose={() => {
          setShowRouteSheetModal(false);
          setSelectedRouteSheet(null);
        }}
        title="Detalles de la Hoja de Ruta"
        class="route-sheets"
        config={routeSheetModalConfig}
        data={selectedRouteSheet}
      />

      {/* Modal de Eliminar hoja de ruta */}
      <ModalDeleteConfirm
        isOpen={showDeleteRouteSheetModal}
        onClose={() => setShowDeleteRouteSheetModal(false)}
        onDelete={handleConfirmDeleteRouteSheet}
        content="hoja de ruta"
        genere="F"
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