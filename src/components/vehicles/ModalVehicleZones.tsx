import React from "react";
import ReactDOM from "react-dom";
import VehicleZonesForm from "./VehicleZonesForm";
import { VehicleZoneFormData } from "../../config/vehicles/vehicleZonesFieldsConfig";
import "../../styles/css/components/vehicles/modalVehicleZones.css";

interface ModalVehicleZonesProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<VehicleZoneFormData>;
  countryOptions: { label: string; value: number }[];
  provinceOptions: { label: string; value: number }[];
  localityOptions: { label: string; value: number }[];
  zoneOptions: { label: string; value: number }[];
  loading?: boolean;
  error?: string | null;
  isEditing?: boolean;
  onFieldChange: (fieldName: string, value: any) => void;
}

const ModalVehicleZones: React.FC<ModalVehicleZonesProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  countryOptions,
  provinceOptions,
  localityOptions,
  zoneOptions,
  loading,
  error,
  isEditing,
  onFieldChange,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-container modalVehicleZones-container">
      <div className="modal-wrapper modalVehicleZones-wrapper">
        <div className="modal-header modal-header">
          <h2 className="modalVehicleZones-title">
            {isEditing ? "Editar asignación de zona" : "Asignar zona al vehículo"}
          </h2>
          <button 
            onClick={onClose} 
            className="modalVehicleZones-button-close"
          >
            <img
              src="/assets/icons/filter-close.svg"
              alt="Cerrar"
              className="modal-icon-close"
              style={{ display: "inline-block" }}
            />
          </button>
        </div>
        <VehicleZonesForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          countryOptions={countryOptions}
          provinceOptions={provinceOptions}
          localityOptions={localityOptions}
          zoneOptions={zoneOptions}
          loading={loading}
          error={error}
          isEditing={isEditing}
          onFieldChange={onFieldChange}
        />
      </div>
    </div>,
    document.body
  );
};

export default ModalVehicleZones;