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
import { userModalConfig } from "../../config/users/userModalConfig";
import ModalDelete from "../../components/common/ModalDelete";

const UsersPage: React.FC = () => {
  const { 
    users, 
    selectedUser, 
    setSelectedUser, 
    handleDelete, 
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
      await handleDelete(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
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
      // Agrega nuevo campo ascendente
      setSortBy([...sortBy, column]);
      setSortDirection([...sortDirection, "asc"]);
    } else if (sortDirection[idx] === "asc") {
      // Cambia a descendente
      const newDirections = [...sortDirection];
      newDirections[idx] = "desc";
      setSortDirection(newDirections);
    } else if (sortDirection[idx] === "desc") {
      // Quita el campo de orden
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

  // Calcular el rango mostrado
  const start = (page - 1) * (users.length || 1) + (users.length > 0 ? 1 : 0);
  const end = (page - 1) * (users.length || 1) + users.length;

  const titlePage = "users";

  return (
    <div className={`p-4 relative overflow-hidden min-h-[500px] h-[100%] ${titlePage+"-page-container"}`}>
      {/* Panel de la tabla */}
      <div
        className={`
          absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out z-10 bg-[#F5F6FA] ${titlePage+"-page-content1"}
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div className={`flex justify-between items-center mb-4 ${titlePage+"-page-header"}`}>
          <SearchBar
            ref={searchInputRef}
            value={search}
            onChange={setSearch}
            placeholder="Buscar usuarios..."
            class={titlePage}
          />
          <button
            onClick={() => setShowFilters(true)}
            className={`bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-2 ${titlePage+"-page-filter-button"}`}
          >
            <img
              src="/assets/icons/filter-icon.svg"
              alt="Filtros"
              className="w-5 h-5"
              style={{ display: "inline-block" }}
            />
            Filtros
          </button>
          <button
            onClick={() => navigate("/usuarios/nuevo-usuario")}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 ${titlePage+"-page-new-user-button"}`}
          >
            <img
              src="/assets/icons/huge-icon.svg"
              alt="Nuevo usuario"
              className="w-5 h-5"
              style={{ display: "inline-block" }}
            />
            Nuevo Usuario
          </button>
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
        {/* Controles de paginación y leyenda */}
        <div className={`flex justify-between items-center mt-4 ${titlePage+"-page-pagination"}`}>
          {/* Leyenda de cantidad */}
          <div className={`text-sm text-gray-600 ${titlePage+"-page-pagination-legend"}`}>
            Mostrando {end > total ? total : end} de {total} usuarios
          </div>
          {/* Paginación numerada */}
          <div className={`flex space-x-1 ${titlePage+"-page-pagination-controls"}`}>
            <button
              className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 ${titlePage+"-page-pagination-botton-prev"}`}
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} ${titlePage+"-page-pagination-button"}`}
                onClick={() => setPage(i + 1)}
                disabled={page === i + 1}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={`px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 ${titlePage+"-page-pagination-button-next"}`}
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
        {/* Drawer de filtros */}
        <FilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          fields={userFilters.map(f => ({
            ...f,
            options: f.options ? [...f.options] : undefined
          }))}  
          values={filters}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </div>

      {/* Panel del formulario */}
      <div
        className={`
          absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${titlePage+"-form-container"}
          ${showForm ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ maxWidth: 500, minHeight: 500 }}
      >
        <div className={`p-6 h-full flex flex-col bg-white shadow-lg ${titlePage+"-form-wrapper"}`}>
          <div className={`flex justify-between items-center mb-4 ${titlePage+"-form-header"}`}>
            <h2 className={`text-xl font-bold ${titlePage+"-form-title"}`}>Editar Usuario</h2>
            <button
              onClick={handleCloseForm}
              className={`text-gray-500 hover:text-gray-700 text-2xl ${titlePage+"-form-close-button"}`}
            >
              ×
            </button>
          </div>
          {/* Solo renderiza el formulario si hay usuario seleccionado */}
          {selectedUser && (
            <UserForm
              onCancel={handleCloseForm}
              isEditing={!!selectedUser}
              userToEdit={selectedUser}
              refreshUsers={refreshUsers}
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
          setSelectedUser(null);
        }}
        title="Detalles del Usuario"
        class={titlePage}
        config={userModalConfig}
        data={selectedUser}
      />

      {/* Modal de Eliminar */}
      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="usuario"
        genere="M"
      />
    </div>
  );
};

export default UsersPage;