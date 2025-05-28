import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { User } from '../../interfaces/User';
import useUsers from '../../hooks/useUsers';
import UserForm from '../../components/users/UserForm';
import { useNavigate } from "react-router-dom";
import { userColumns } from "../../config/UserFields";
import SearchBar from "../../components/common/SearchBar";
import FilterDrawer from "../../components/common/FilterDrawer";
import { userFilters } from "../../config/userFilters";

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
    setFilters
  } = useUsers();
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [users]);

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      const success = await handleDelete(id);
      if (success) {
        console.log('Usuario eliminado con éxito');
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

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  // Calcular el rango mostrado
  const start = (page - 1) * (users.length || 1) + (users.length > 0 ? 1 : 0);
  const end = (page - 1) * (users.length || 1) + users.length;

  return (
    <div className="p-4 relative overflow-hidden min-h-[500px] h-[100%]">
      {/* Panel de la tabla */}
      <div
        className={`
          absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out z-10 bg-[#F5F6FA]
          ${showForm ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <SearchBar
            ref={searchInputRef}
            value={search}
            onChange={setSearch}
            placeholder="Buscar usuarios..."
          />
          <button
            onClick={() => setShowFilters(true)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Filtros
          </button>
          <button
            onClick={() => navigate("/usuarios/nuevo-usuario")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
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
        />
        {/* Controles de paginación y leyenda */}
        <div className="flex justify-between items-center mt-4">
          {/* Leyenda de cantidad */}
          <div className="text-sm text-gray-600">
            Mostrando {end > total ? total : end} de {total} usuarios
          </div>
          {/* Paginación numerada */}
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setPage(i + 1)}
                disabled={page === i + 1}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
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
          absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out
          bg-white shadow-lg 
          ${showForm ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ maxWidth: 500, minHeight: 500 }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Editar Usuario</h2>
            <button
              onClick={handleCloseForm}
              className="text-gray-500 hover:text-gray-700 text-2xl"
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
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="font-bold">Nombre:</label>
              <p>{selectedUser.name}</p>
            </div>
            <div>
              <label className="font-bold">Email:</label>
              <p>{selectedUser.email}</p>
            </div>
            <div>
              <label className="font-bold">Rol:</label>
              <p>{selectedUser.role === 'ADMIN' ? 'Administrador' : 'Usuario'}</p>
            </div>
            <div>
              <label className="font-bold">Estado:</label>
              <p>{selectedUser.isActive ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;