import React, { useState, useEffect } from "react";
import { useVehicleZones } from "../../hooks/useVehicleZones";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import { vehicleZonesListColumns } from "../../config/vehicles/vehicleZonesListColumns";
import { vehicleZonesModalConfig } from "../../config/vehicles/vehicleZonesModalConfig";
import { VehicleZone } from "../../services/VehicleZonesService";
import ModalVehicleZones from "./ModalVehicleZones";
import { Modal } from "../common/Modal";
import ModalDeleteConfirm from "../common/ModalDeleteConfirm";
import { ListItem } from "../common/ListItem";
import "../../styles/css/components/vehicles/vehicleZones.css";

interface VehicleZonesProps {
  vehicleId: number;
  isEditing?: boolean;
}

const VehicleZones: React.FC<VehicleZonesProps> = ({ vehicleId, isEditing }) => {
  const {
    vehicleZones,
    isLoading,
    error,
    fetchVehicleZones,
    assignZones,
    removeZone,
  } = useVehicleZones();

  const {
    countries,
    provinces,
    localities,
    zones,
  } = useDependentLocationFields();

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<VehicleZone | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<VehicleZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoneError, setZoneError] = useState<string | null>(null);

  // Para selects dependientes
  const [formValues, setFormValues] = useState<any>({});

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleZones(vehicleId);
    }
  }, [vehicleId, fetchVehicleZones]);

  const handleAddZone = () => {
    setSelectedZone(null);
    setShowModal(true);
  };

  const handleAssignZone = async (values: any) => {
    setLoading(true);
    setZoneError(null);
    try {
      await assignZones(vehicleId, values);
      setShowModal(false);
    } catch (err: any) {
      setZoneError(err.message || "Error al asignar zona");
    } finally {
      setLoading(false);
    }
  };

  const handleViewZone = (zone: VehicleZone) => {
    setSelectedZone(zone);
    setShowViewModal(true);
  };

  const handleRemoveZone = (zone: VehicleZone) => {
    setZoneToDelete(zone);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (zoneToDelete) {
      setLoading(true);
      try {
        await removeZone(vehicleId, zoneToDelete.zone_id);
        setShowDeleteModal(false);
        setZoneToDelete(null);
      } catch (err: any) {
        setZoneError(err.message || "Error al remover zona");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler para selects dependientes
  const baseHandleFieldChange = handleDependentLocationChange<any>(setFormValues);
  const handleFieldChange = (fieldName: string, value: any) => {
    baseHandleFieldChange(fieldName as any, value);
    setFormValues((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  // Opciones filtradas según la selección actual
  const {
    countryOptions,
    provinceOptions,
    localityOptions,
    zoneOptions,
  } = getDependentLocationOptions(
    countries,
    provinces,
    localities,
    zones,
    formValues.countryId ?? 0,
    formValues.provinceId ?? 0,
    formValues.localityId ?? 0
  );

  if (!isEditing) return null;

  return (
    <div className="vehicleZones-actions-container">
      <div className="vehicleZones-actions-title">
        <h3 className="vehicleZones-title">Zonas asignadas</h3>
        <button 
          className="page-new-button vehicleZones-new-button"
          onClick={handleAddZone}
          disabled={loading}
        >
          <img
            src="/assets/icons/huge-icon.svg"
            alt="Agregar abono"
            className={`page-new-button-icon`}
            style={{ display: "inline-block" }}
          />
          Asignar Zona
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {zoneError && <div className="error-message">{zoneError}</div>}

      <div className="vehicle-zones-list">
        <ListItem
          items={vehicleZones}
          columns={vehicleZonesListColumns}
          getKey={item => item.vehicle_zone_id}
          content="asignación de zona"
          genere="F"
          onRemove={handleRemoveZone}
          onView={handleViewZone}
        />
      </div>

      {/* Modal para asignar zona */}
      <ModalVehicleZones
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAssignZone}
        countryOptions={countryOptions}
        provinceOptions={provinceOptions}
        localityOptions={localityOptions}
        zoneOptions={zoneOptions}
        loading={loading}
        error={zoneError}
        isEditing={false}
        onFieldChange={handleFieldChange}
      />

      {/* Modal para ver detalles */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalles de la zona asignada"
        class="vehicle-zones"
        config={vehicleZonesModalConfig}
        data={selectedZone}
      />

      {/* Modal de confirmación de eliminación */}
      <ModalDeleteConfirm
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        content="asignación de zona"
        genere="F"
      />
    </div>
  );
};

export default VehicleZones;