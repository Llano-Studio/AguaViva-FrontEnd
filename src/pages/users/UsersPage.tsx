import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { User } from '../../interfaces/User';
import useUsers from '../../hooks/useUsers';
import UserForm from '../../components/users/UserForm';
import { useNavigate } from "react-router-dom";
import { userColumns } from "../../config/users/userFieldsConfig";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { userFilters } from "../../config/users/userFiltersConfig";
import {userModalConfig}  from "../../config/users/userModalConfig";
import ModalDeleteConfirm from "../../components/common/ModalDeleteConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import '../../styles/css/pages/pages.css';
import PaginationControls from "../../components/common/PaginationControls";

const UsersPage: React.FC = () => {
  const { 
    users, 
    selectedUser, 
    setSelectedUser, 
    deleteUser, 
    isLoading,
    error,
    refreshUsers,
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
  } = useUsers();
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [users]);

  const handleDeleteClick = (id: number) => {
    const user = users.find(u => u.id === id);
    setUserToDelete(user || null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        showSnackbar("Usuario eliminado correctamente.", "success");
        refreshUsers();
      } catch (err: any) {
        showSnackbar(err?.message || "Error al eliminar usuario", "error");
      } finally {
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedUser(null);
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

  // Maneja el éxito en crear/editar usuario
  const handleFormSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    setShowForm(false);
    setSelectedUser(null);
    refreshUsers();
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  // Calcular el rango mostrado
  const start = (page - 1) * (users.length || 1) + (users.length > 0 ? 1 : 0);
  const end = (page - 1) * (users.length || 1) + users.length;

  const titlePage = "users";

  return (
    <div className={`table-scroll page-container ${titlePage+"-page-container"}`}>
      {/* Panel de la tabla */}
      <div
        className={`page-content ${titlePage+"-page-content"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div>
          <h1 className={`page-title ${titlePage+"-page-title"}`}>Usuarios</h1>
        </div>
        <div className={`page-header ${titlePage+"-page-header"}`}>
          <div className={`page-header-div-1 ${titlePage+"-page-header-div-1"}`}>
            <SearchBar
              ref={searchInputRef}
              value={search}
              onChange={setSearch}
              placeholder="Buscar usuarios..."
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
              onClick={() => navigate("/usuarios/nuevo-usuario")}
              className={`page-new-button ${titlePage+"-page-new-button"}`}
            >
              <img
                src="/assets/icons/huge-icon.svg"
                alt="Nuevo usuario"
                className={`page-new-button-icon ${titlePage+"-page-new-button-icon"}`}
                style={{ display: "inline-block" }}
              />
              Nuevo Usuario
            </button>
          </div>
        </div>
        <DataTable
          data={users}
          columns={userColumns}
          onView={(user) => {
            setSelectedUser(user);
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
          label="usuarios"
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
            <h2 className={`form-title ${titlePage+"-form-title"}`}>Editar Usuario</h2>
          </div>
          {/* Solo renderiza el formulario si hay usuario seleccionado */}
          {selectedUser && (
            <UserForm
              onCancel={handleCloseForm}
              isEditing={!!selectedUser}
              userToEdit={selectedUser}
              refreshUsers={refreshUsers}
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
          setSelectedUser(null);
        }}
        title="Detalles del Usuario"
        class={titlePage}
        config={userModalConfig}
        data={selectedUser}
      />

      {/* Modal de Eliminar */}
      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="usuario"
        genere="M"
      />

      {/* Drawer de filtros */}
      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        fields={userFilters}
        values={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default UsersPage;