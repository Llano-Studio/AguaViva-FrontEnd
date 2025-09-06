import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Client } from '../../interfaces/Client';
import useClients from '../../hooks/useClients';
import useZones from '../../hooks/useZones';
import ClientForm from '../../components/clients/ClientForm';
import { useNavigate } from "react-router-dom";
import { clientColumns } from "../../config/clients/clientFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { clientFilters } from "../../config/clients/clientFiltersConfig";
import { clientModalConfig } from "../../config/clients/clientModalConfig";
import { clientComodatoListColumns } from "../../config/clients/clientComodatoListColumns";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import Switch from "../../components/common/Switch";
import { useSnackbar } from "../../context/SnackbarContext";
import '../../styles/css/pages/pages.css';
import PaginationControls from "../../components/common/PaginationControls";
import useLocations from "../../hooks/useLocations";

const ClientsPage: React.FC = () => {
  const { 
    clients, 
    selectedClient, 
    setSelectedClient, 
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
    fetchClients,
    deleteClient,
    // Reemplazamos productos prestados por comodatos
    fetchPersonComodatos,
    comodatos,
  } = useClients();

  const { zones, fetchZones } = useZones();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [semaphoreOn, setSemaphoreOn] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { showSnackbar } = useSnackbar();
  const { localities, fetchLocalities } = useLocations();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [clients]);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    fetchLocalities();
  }, []);

  useEffect(() => {
    fetchZones(); 
  }, []);

  const dynamicClientFilters = clientFilters.map((filter) => {
    if (filter.name === "zoneIds") {
      return {
        ...filter,
        options: zones.map((zone) => ({
          label: zone.name,
          value: zone.zone_id.toString(),
        })),
      };
    }
    if (filter.name === "localityIds") {
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

  const handleDeleteClick = (id: number) => {
    const client = clients.find(c => c.person_id === id);
    setClientToDelete(client || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.person_id);
      showSnackbar("Cliente eliminado correctamente.", "success");
      await fetchClients();
    } catch (err: any) {
      showSnackbar(err?.message || "Error al eliminar cliente", "error");
    } finally {
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedClient(null);
    setShowForm(false);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const transformedFilters = { ...filters };
    if (filters.locality && Array.isArray(filters.locality)) {
      transformedFilters.localityIds = filters.locality.join(",");
      delete transformedFilters.locality;
    }

    setFilters(transformedFilters);
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

  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    setShowForm(false);
    setSelectedClient(null);
    fetchClients();
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    try {
      await fetchPersonComodatos(client.person_id);
    } catch (e) {
      console.error("Error al obtener comodatos:", e);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  const start = (page - 1) * (clients.length || 1) + (clients.length > 0 ? 1 : 0);
  const end = (page - 1) * (clients.length || 1) + clients.length;

  const titlePage = "clients";

  return (
    <div className={`table-scroll page-container ${titlePage+"-page-container"}`}>
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Clientes</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar clientes..."
              class={titlePage}
            />
          </div>
          <div className={`page-header-div-2 ${titlePage+"-page-header-div-2"}`}>
            <div className='page-switch-container'>
              <Switch
                value={semaphoreOn ? "on" : "off"}
                onChange={v => setSemaphoreOn(v === "on")}
                options={["off", "on"]}
                labels={["", ""]}
              />
              <p className='page-title-switch-status'>Estado de cuenta</p>
            </div>
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
              onClick={() => navigate("/clientes/nuevo-cliente")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nuevo cliente"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nuevo Cliente
            </button>
          </div>
        </div>
        <DataTable
          data={clients.map(c => ({ ...c, id: c.person_id }))}
          columns={clientColumns}
          onView={handleViewClient}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          class={titlePage}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          useSemaphoreStatus={semaphoreOn}
          semaphoreField="payment_semaphore_status"
          semaphoreColorMap={{
            GREEN: "#E9FFF6",
            YELLOW: "#FFFCDA",
            RED: "#FFDFDF",
            NONE: "#FFFFFF",
          }}
          semaphoreActive={semaphoreOn}
        />
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          start={start}
          end={end}
          total={total}
          label="clientes"
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
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Cliente</h2>
          </div>
          {selectedClient && (
            <ClientForm
              onCancel={handleCloseForm}
              isEditing={!!selectedClient}
              clientToEdit={selectedClient}
              refreshClients={async () => { await fetchClients(); }}
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
          setSelectedClient(null);
        }}
        title="Detalles del Cliente"
        class={titlePage}
        config={clientModalConfig}
        data={selectedClient}
        itemsForList={comodatos}
        itemsConfig={clientComodatoListColumns}
        itemsTitle="Productos en Comodato"
      />

      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="cliente"
        genere="M"
      />

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={dynamicClientFilters}
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default ClientsPage;