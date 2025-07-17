import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { Vehicle } from "../../interfaces/Vehicle";
import useVehicles from "../../hooks/useVehicles";
import VehicleForm from "../../components/vehicles/VehicleForm";
import { useNavigate } from "react-router-dom";
import { vehicleColumns } from "../../config/vehicles/vehicleFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { vehicleFilters } from "../../config/vehicles/vehicleFilterConfig";
import { vehicleModalConfig } from "../../config/vehicles/vehicleModalConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import useVehicleAssignments from "../../hooks/useVehicleAssignments";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/pages.css";
import PaginationControls from "../../components/common/PaginationControls";

const VehiclesPage: React.FC = () => {
  const {
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    deleteVehicle,
    isLoading,
    error,
    refreshVehicles,
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
  } = useVehicles();

  const {
    assignedZones,
    assignedUsers,
    fetchVehicleZones,
    fetchVehicleUsers,
  } = useVehicleAssignments();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [modalVehicle, setModalVehicle] = useState<any>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [vehicles]);

  const handleDeleteClick = (id: number) => {
    const vehicle = vehicles.find(v => v.vehicle_id === id);
    setVehicleToDelete(vehicle || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicle(vehicleToDelete.vehicle_id);
        showSnackbar("Vehículo eliminado correctamente.", "success");
        await refreshVehicles();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar vehículo", "error");
      } finally {
        setShowDeleteModal(false);
        setVehicleToDelete(null);
      }
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedVehicle(null);
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

  // Manejo para mostrar zonas y usuarios asignados en el modal
  const handleViewVehicle = async (vehicle: Vehicle) => {
    const zones = await fetchVehicleZones(vehicle.vehicle_id);
    const users = await fetchVehicleUsers(vehicle.vehicle_id);
    setModalVehicle({
      ...vehicle,
      assignedZones: zones || [],
      assignedUsers: users || [],
    });
    setShowViewModal(true);
  };

  // Maneja el éxito en crear/editar vehículo
  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    setShowForm(false);
    setSelectedVehicle(null);
    refreshVehicles();
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  const start = (page - 1) * (vehicles.length || 1) + (vehicles.length > 0 ? 1 : 0);
  const end = (page - 1) * (vehicles.length || 1) + vehicles.length;

  const titlePage = "vehicles";

  return (
    <div className={`page-container ${titlePage+"-page-container"}`}>
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Móviles</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar vehículos..."
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
              onClick={() => navigate("/moviles/nuevo-movil")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nuevo vehículo"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nuevo Móvil
            </button>
          </div>
        </div>
        <DataTable
          data={vehicles.map(v => ({ ...v, id: v.vehicle_id }))}
          columns={vehicleColumns}
          onView={handleViewVehicle}
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
          label="móviles"
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
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Móvil</h2>
          </div>
          {selectedVehicle && (
            <VehicleForm
              onCancel={handleCloseForm}
              isEditing={!!selectedVehicle}
              vehicleToEdit={selectedVehicle}
              refreshVehicles={async () => { await refreshVehicles(); }}
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
          setModalVehicle(null);
        }}
        title="Detalles del Móvil"
        class={titlePage}
        config={vehicleModalConfig}
        data={modalVehicle}
      />

      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="vehículo"
        genere="M"
      />

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={vehicleFilters}
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default VehiclesPage;