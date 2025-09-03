import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Zone } from '../../interfaces/Locations';
import useZones from '../../hooks/useZones';
import ZoneForm from '../../components/zones/ZoneForm';
import { useNavigate } from "react-router-dom";
import { zoneColumns } from "../../config/zones/zoneFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { zoneFilters } from "../../config/zones/zoneFilterConfig";
import { zoneModalConfig } from "../../config/zones/zoneModalConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import '../../styles/css/pages/pages.css';
import PaginationControls from "../../components/common/PaginationControls";
import useLocations from "../../hooks/useLocations"; // Importar el hook de ubicaciones
import ModalLocalities from "../../components/zones/ModalLocalities";


const ZonesPage: React.FC = () => {
  const { 
    zones, 
    selectedZone, 
    setSelectedZone,
    deleteZone, 
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
    fetchZones,
  } = useZones();
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showLocalitiesModal, setShowLocalitiesModal] = useState(false);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [zones]);

  const handleDeleteClick = (id: number) => {
    const zone = zones.find(z => z.zone_id === id);
    setZoneToDelete(zone || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (zoneToDelete) {
      try {
        await deleteZone(zoneToDelete.zone_id);
        showSnackbar("Zona eliminada correctamente.", "success");
        await fetchZones();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar zona", "error");
      } finally {
        setShowDeleteModal(false);
        setZoneToDelete(null);
      }
    }
  };

  const handleEditClick = (zone: Zone) => {
    setSelectedZone(zone);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedZone(null);
    setShowForm(false);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };


  const handleApplyFilters = () => {
    const transformedFilters = { ...filters };

    // Cambiar el nombre del filtro de "locality" a "locality_id"
    if (filters.locality) {
      transformedFilters.locality_id = filters.locality; // Renombrar el filtro
      delete transformedFilters.locality; // Eliminar el campo original
    }

    setFilters(transformedFilters); // Guardar los filtros transformados
    setShowFilters(false);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setShowFilters(false);
    setPage(1);
  };

  const { localities, fetchLocalities } = useLocations();

  useEffect(() => {
    fetchLocalities();
  }, []);

  const dynamicZoneFilters = zoneFilters.map((filter) => {
    if (filter.name === "locality_ids") {
      return {
        ...filter,
        options: localities.map((locality) => ({
          label: locality.name,
          value: locality.locality_id.toString(),
        })),
      };
    }
    return filter;
  });

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

  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    handleCloseForm();
    setShowForm(false);
    fetchZones();
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  const start = (page - 1) * (zones.length || 1) + (zones.length > 0 ? 1 : 0);
  const end = (page - 1) * (zones.length || 1) + zones.length;

  const titlePage = "zones";

  return (
    <div className={`table-scroll page-container ${titlePage+"-page-container"}`}>
      {/* Panel de la tabla */}
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Zonas</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar zonas..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage+"-page-header-div-2"}`}>
            <button
              onClick={() => setShowLocalitiesModal(true)}
              className={`page-action-button ${titlePage}-page-action-button`}
            >
              Localidades
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
              onClick={() => navigate("/zonas/nueva-zona")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nueva zona"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nueva Zona
            </button>
          </div>
        </div>
        <DataTable
          data={zones.map(z => ({ ...z, id: z.zone_id }))}
          columns={zoneColumns}
          onView={(zone) => {
            setSelectedZone(zone);
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
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          start={start}
          end={end}
          total={total}
          label="zonas"
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
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Zona</h2>
          </div>
          {selectedZone && (
            <ZoneForm
              onCancel={handleCloseForm}
              isEditing={!!selectedZone}
              zoneToEdit={selectedZone}
              refreshZones={async () => { await fetchZones(); }}
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
          setSelectedZone(null);
        }}
        title="Detalles de la Zona"
        class={titlePage}
        config={zoneModalConfig}
        data={selectedZone}
      />

      {/* Modal de Eliminar */}
      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="zona"
        genere="F"
      />

      <ModalLocalities
        isOpen={showLocalitiesModal}
        onClose={() => setShowLocalitiesModal(false)}
      />

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={dynamicZoneFilters} // Usar filtros dinámicos
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default ZonesPage;