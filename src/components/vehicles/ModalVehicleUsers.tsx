import React from "react";
import ReactDOM from "react-dom";
import VehicleUsersForm from "./VehicleUsersForm";
import "../../styles/css/components/vehicles/modalVehicleUsers.css";

interface ModalVehicleUsersProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  userOptions: { label: string; value: number }[];
  vehicleId: number;
  loading?: boolean;
  error?: string | null;
}

const ModalVehicleUsers: React.FC<ModalVehicleUsersProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userOptions,
  vehicleId,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-container modalVehicleUsers-container">
      <div className="modal-wrapper modalVehicleUsers-wrapper">
        <div className="modal-header">
          <h2 className="modalVehicleUsers-title">Asignar chofer al vehículo</h2>
          <button onClick={onClose} className="modalVehicleUsers-button-close">
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-close"
              style={{ display: "inline-block" }}
            />
          </button>
        </div>
        <VehicleUsersForm
          userOptions={userOptions}
          vehicleId={vehicleId}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
          error={error}
        />
      </div>
    </div>,
    document.body
  );
};

export default ModalVehicleUsers;