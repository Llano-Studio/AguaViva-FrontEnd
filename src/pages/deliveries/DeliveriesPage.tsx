import React, { useState, useRef, useEffect, useMemo } from "react";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import useDeliveries from "../../hooks/useDeliveries";
import { deliveryColumns } from "../../config/deliveries/deliveryFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { deliveryFilters } from "../../config/deliveries/deliveryFilterConfig";
import { deliveryModalConfig } from "../../config/deliveries/deliveryModalConfig";
import "../../styles/css/pages/pages.css";
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
import SpinnerLoading from "../../components/common/SpinnerLoading";
import useAutomatedCollectionOrder from "../../hooks/useAutomatedCollectionOrder";
import { automatedCollectionOrderColumns, automatedCollectionOrderModalConfig } from "../../config/automatedCollectionOrders/automatedCollectionOrderFieldsConfig";
import useVehicles from "../../hooks/useVehicles";
import useZones from "../../hooks/useZones";

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

  const {
    items: autoRouteSheets,
    total: autoTotal,
    isLoading: isLoadingAuto,
    error: errorAuto,
    fetchGeneratedRouteSheets,
    generateCollectionPdf,
  } = useAutomatedCollectionOrder();

  // Catálogos para mostrar nombres en vez de IDs (vehículos, zonas, choferes)
  const { vehicles: vehicleCatalog, fetchVehicles: fetchVehicleCatalog } = useVehicles();
  const { zones: zoneCatalog, fetchZones: fetchZoneCatalog } = useZones();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showRouteSheetModal, setShowRouteSheetModal] = useState(false);
  const [showRouteSheetForm, setShowRouteSheetForm] = useState(false);
  const [showDeleteRouteSheetModal, setShowDeleteRouteSheetModal] = useState(false);
  const [routeSheetToDelete, setRouteSheetToDelete] = useState<any>(null);

  const [autoPage, setAutoPage] = useState(1);
  const [autoLimit] = useState(10);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [selectedAutoItem, setSelectedAutoItem] = useState<any>(null);

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    fetchRouteSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchGeneratedRouteSheets({ page: autoPage, limit: autoLimit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPage, autoLimit]);

  // Cargar catálogos (vehículos, zonas y choferes role=DRIVERS)
  useEffect(() => {
    fetchVehicleCatalog?.();
    fetchZoneCatalog?.();
  }, []);

  // Mapas ID -> Nombre
  const vehicleNameById = useMemo(() => {
    const m = new Map<number, string>();
    (vehicleCatalog || []).forEach((v: any) => {
      if (v?.vehicle_id != null) m.set(Number(v.vehicle_id), String(v?.name ?? v?.code ?? v?.vehicle_id));
    });
    return m;
  }, [vehicleCatalog]);

  const zoneNameById = useMemo(() => {
    const m = new Map<number, string>();
    (zoneCatalog || []).forEach((z: any) => {
      if (z?.zone_id != null) m.set(Number(z.zone_id), String(z?.name ?? z?.code ?? z?.zone_id));
    });
    return m;
  }, [zoneCatalog]);

  // Enriquecer datos de “cobranzas automáticas” con nombres
  const autoData = useMemo(() => {
    return (autoRouteSheets || []).map((it: any, idx: number) => {
      const vehicleName =
        vehicleNameById.get(Number(it?.vehicleId)) ??
        (it?.vehicleId != null ? String(it.vehicleId) : "-");

      const zoneNames = Array.isArray(it?.zoneIds) && it.zoneIds.length
        ? it.zoneIds.map((id: any) => zoneNameById.get(Number(id)) ?? String(id)).join(", ")
        : "-";

      // Preferir driverName del backend. Si viene null y hay lista 'drivers', concatenar nombres.
      const driverName =
        (it?.driverName && String(it.driverName)) ||
        (Array.isArray(it?.drivers) && it.drivers.length
          ? it.drivers.map((d: any) => d?.name).filter(Boolean).join(", ")
          : "-");

      return {
        ...it,
        id: it?.route_sheet_id ?? it?.routeSheetId ?? it?.filename ?? idx,
        vehicleName,
        zoneNames,
        driverName,
      };
    });
  }, [autoRouteSheets, vehicleNameById, zoneNameById]);

  const handleViewAuto = (item: any) => {
    const enriched =
      autoData.find(d => d.id === (item?.route_sheet_id ?? item?.routeSheetId ?? item?.id)) ?? item;
    setSelectedAutoItem(enriched);
    setShowAutoModal(true);
  };

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
    const sheet = routeSheets.find((r) => r.route_sheet_id === id);
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
        showLogs: false,
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
    return (
      <div className="p-4 container-loading">
        <SpinnerLoading />
      </div>
    );
  }

  const handleDownloadAuto = async (item: any) => {
    try {
      const possibleId =
        item?.route_sheet_id ??
        item?.routeSheetId ??
        item?.id;

      if (Number.isFinite(Number(possibleId))) {
        const res = await generateCollectionPdf(Number(possibleId), {});
        if (res?.url && res?.filename) {
          await downloadPDF({ url: res.url, filename: res.filename, baseURL: BASE_URL, showLogs: false });
          showSnackbar("PDF de cobranza automática generado y descargado.", "success");
          return;
        }
      }

      if (item?.downloadUrl && item?.filename) {
        await downloadPDF({ url: item.downloadUrl, filename: item.filename, baseURL: BASE_URL, showLogs: false });
        showSnackbar("Archivo de cobranza automática descargado.", "success");
        return;
      }

      showSnackbar("No fue posible generar ni descargar el archivo.", "error");
    } catch (err: any) {
      showSnackbar(err?.message || "Error al descargar PDF de cobranzas automáticas", "error");
    }
  };

  const start = total > 0 ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);

  const routeSheetStart =
    (routeSheetPage - 1) * (routeSheets.length || 1) + (routeSheets.length > 0 ? 1 : 0);
  const routeSheetEnd =
    (routeSheetPage - 1) * (routeSheets.length || 1) + routeSheets.length;

  const titlePage = "deliveries";

  // Paginación de la sección auto
  const autoStart = autoTotal > 0 ? (autoPage - 1) * autoLimit + 1 : 0;
  const autoEnd = Math.min(autoPage * autoLimit, autoTotal);
  const autoTotalPages = Math.ceil((autoTotal || 0) / autoLimit) || 1;

  return (
    <div className={`table-scroll page-container ${titlePage + "-page-container"}`}>
      <div
        className={`page-content ${titlePage + "-page-content"}
          ${showRouteSheetForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage + "-page-title"}`}>Entregas</h1>
        </div>
        <div className={`page-header ${titlePage + "-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage + "-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar entregas..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage + "-page-header-div-2"}`}>
            <button
              onClick={() => setShowFilters(true)}
              className={`page-filter-button ${titlePage + "-page-filter-button"}`}
            >
              <img
                src="/assets/icons/filter-icon.svg"
                alt="Filtros"
                className={`page-filter-button-icon ${titlePage + "-page-filter-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Filtros
            </button>
            <button
              onClick={() => navigate("/hojas-de-ruta/nueva-hoja-de-ruta")}
              className={`page-new-button ${titlePage + "-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Generar hoja de ruta"
                className={`page-new-button-icon ${titlePage + "-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Generar hoja de ruta
            </button>
          </div>
        </div>

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
          className={titlePage + "-page-pagination"}
        />

        <div className="route-sheets-section-container">
          <h2 className="page-title">Hojas de Ruta</h2>
          {errorRouteSheets && <div className="text-red-500 p-2">{errorRouteSheets}</div>}
          <DataTable
            data={routeSheets.map((r) => ({ ...r, id: r.route_sheet_id }))}
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

        {/* Nueva sección: Hojas de ruta de cobranzas automáticas */}
        <div className="route-sheets-section-container">
          <h2 className="page-title">Hojas de Ruta de Cobranzas Automáticas</h2>
          {errorAuto && <div className="text-red-500 p-2">{errorAuto}</div>}
          <DataTable
            data={autoData}
            columns={automatedCollectionOrderColumns}
            onView={handleViewAuto}
            onDownload={handleDownloadAuto}
            class="auto-collection-route-sheets"
          />
          <PaginationControls
            page={autoPage}
            totalPages={autoTotalPages}
            onPageChange={setAutoPage}
            start={autoStart}
            end={autoEnd}
            total={autoTotal}
            label="hojas de ruta (cobranzas)"
            className="auto-collection-route-sheets-pagination"
          />
        </div>
      </div>

      <div
        className={`form-container route-sheets-form-container
          ${showRouteSheetForm ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="form-wrapper route-sheets-form-wrapper">
          <div className="form-header route-sheets-form-header">
            <button
              onClick={handleCloseRouteSheetForm}
              className="form-close-button route-sheets-form-close-button"
            >
              <img
                src="/assets/icons/back.svg"
                alt="Volver"
                className="form-icon-cancel route-sheets-form-icon-cancel"
              />
            </button>
            <h2 className="form-title route-sheets-form-title">
              {selectedRouteSheet ? "Editar hoja de ruta" : "Generar hoja de ruta"}
            </h2>
          </div>
          <RouteSheetForm
            onSubmit={
              selectedRouteSheet
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

      <ModalDeleteConfirm
        isOpen={showDeleteRouteSheetModal}
        onClose={() => setShowDeleteRouteSheetModal(false)}
        onDelete={handleConfirmDeleteRouteSheet}
        content="hoja de ruta"
        genere="F"
      />
      
      {/* Modal detalle de cobranza automática */}
      <Modal
        isOpen={showAutoModal}
        onClose={() => {
          setShowAutoModal(false);
          setSelectedAutoItem(null);
        }}
        title="Detalle Hoja de Ruta de Cobranzas Automáticas"
        class="auto-collection-route-sheets"
        config={automatedCollectionOrderModalConfig}
        data={selectedAutoItem}
      />

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