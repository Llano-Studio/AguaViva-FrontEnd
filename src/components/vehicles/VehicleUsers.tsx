import React, { useState, useEffect } from "react";
import { useVehicleUsers } from "../../hooks/useVehicleUsers";
import { vehicleUsersListColumns } from "../../config/vehicles/vehicleUsersListColumns";
import { vehicleUsersModalConfig } from "../../config/vehicles/vehicleUsersModalConfig";
import { Modal } from "../common/Modal";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import { ListItem } from "../common/ListItem";
import ModalVehicleUsers from "./ModalVehicleUsers";
import { UserService } from "../../services/UserService";
import "../../styles/css/components/vehicles/vehicleUsers.css";

interface VehicleUsersProps {
  vehicleId: number;
  isEditing?: boolean;
}

const VehicleUsers: React.FC<VehicleUsersProps> = ({ vehicleId, isEditing }) => {
  const {
    vehicleUsers,
    isLoading,
    error,
    fetchVehicleUsers,
    assignUsers,
    removeUser,
  } = useVehicleUsers();

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);

  const updateUserOptions = () => {
    new UserService().getUsers({ role: "DRIVERS" }).then(res => {
      const assignedIds = new Set(vehicleUsers.map((u: any) => u.id));
      const availableDrivers = res.data.filter((u: any) => !assignedIds.has(u.id));
      setUserOptions(
        availableDrivers.map((u: any) => ({
          label: u.name + " (" + u.email + ")",
          value: u.id,
        }))
      );
    });
  };

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleUsers(vehicleId).then((assigned = []) => {
        new UserService().getUsers({ role: "DRIVERS" }).then(res => {
          const assignedIds = new Set(assigned.map((u: any) => u.id));
          const availableDrivers = res.data.filter((u: any) => !assignedIds.has(u.id));
          setUserOptions(
            availableDrivers.map((u: any) => ({
              label: u.name + " (" + u.email + ")",
              value: u.id,
            }))
          );
        });
      });
    }
    // eslint-disable-next-line
  }, [vehicleId, fetchVehicleUsers]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
    updateUserOptions();
  };

  const handleAssignUser = async (values: any) => {
    await assignUsers(values.userId, {
      vehicleIds: [vehicleId],
      notes: values.notes,
      isActive: values.isActive,
    });
    setShowModal(false);
    updateUserOptions();
  };

  const handleViewUser = async (user: any) => {
    try {
        const vehicles = await new UserService().getUserVehicles(user.id);
        // Filtra solo la asignación del vehículo actual
        const assignment = vehicles.find((v: any) => v.vehicle_id === vehicleId);
        if (assignment) {
        setSelectedUser(assignment); // Ahora selectedUser es la asignación, no solo el usuario
        setShowViewModal(true);
        }
    } catch (e) {
        setSelectedUser(null);
        setShowViewModal(true);
    }
    };

  const handleRemoveUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await removeUser(userToDelete.id, vehicleId);
      setShowDeleteModal(false);
      setUserToDelete(null);
      updateUserOptions();
    }
  };

  if (!isEditing) return null;

  return (
    <div className="vehicleUsers-actions-container">
      <div className="vehicleUsers-actions-title">
        <h3 className="vehicleUsers-title">Choferes asignados</h3>
        <button
          className="page-new-button vehicleUsers-new-button"
          onClick={handleAddUser}
          disabled={isLoading}
        >
          <img
            src="/assets/icons/huge-icon.svg"
            alt="Agregar chofer"
            className="page-new-button-icon"
            style={{ display: "inline-block" }}
          />
          Asignar Chofer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="vehicle-users-list">
        <ListItem
          items={vehicleUsers}
          columns={vehicleUsersListColumns}
          getKey={item => item.id}
          content="asignación de chofer"
          genere="M"
          onRemove={handleRemoveUser}
          onView={handleViewUser}
        />
      </div>

      {/* Modal para asignar chofer */}
      <ModalVehicleUsers
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAssignUser}
        userOptions={userOptions}
        vehicleId={vehicleId}
        loading={isLoading}
        error={error}
      />

      {/* Modal para ver detalles */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
        }}
        title="Detalles del chofer asignado"
        class="vehicle-users"
        config={vehicleUsersModalConfig}
        data={selectedUser}
        />

      {/* Modal de confirmación de eliminación */}
      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="asignación de chofer"
        genere="M"
      />
    </div>
  );
};

export default VehicleUsers;