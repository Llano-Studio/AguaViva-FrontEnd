import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateVehicleDTO, Vehicle } from "../../interfaces/Vehicle";
import { ItemForm } from "../common/ItemForm";
import { vehicleFields } from "../../config/vehicles/vehicleFieldsConfig";
import useVehicles from "../../hooks/useVehicles";
import useVehicleAssignments from "../../hooks/useVehicleAssignments";
import { Zone } from "../../interfaces/Locations";
import { User } from "../../interfaces/User";
import { ZoneService } from "../../services/ZoneService";
import { UserService } from "../../services/UserService";
import VehicleZones from "./VehicleZones";
import ModalUpdateConfirm from "../common/ModalUpdateConfirm";
import { useSnackbar } from "../../context/SnackbarContext";
import VehicleUsers from "./VehicleUsers";

interface VehicleFormProps {
  onCancel: () => void;
  isEditing: boolean;
  vehicleToEdit?: Vehicle | null;
  refreshVehicles: () => Promise<void>;
  class?: string;
  onSuccess?: (msg: string) => void;
}

const getInitialValues = (
  isEditing: boolean,
  vehicleToEdit?: Vehicle | null
): CreateVehicleDTO => {
  if (isEditing && vehicleToEdit) {
    return {
      code: vehicleToEdit.code,
      name: vehicleToEdit.name,
      description: vehicleToEdit.description,
    };
  }
  return {
    code: "",
    name: "",
    description: "",
  };
};

const VehicleForm: React.FC<VehicleFormProps> = ({
  onCancel,
  isEditing,
  vehicleToEdit,
  refreshVehicles,
  class: classForm,
  onSuccess,
}) => {
  const { createVehicle, updateVehicle } = useVehicles();
  const [error, setError] = useState<string | null>(null);

  // Para selects de zonas y usuarios
  const [allZones, setAllZones] = useState<Zone[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Modal de confirmación de actualización
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<CreateVehicleDTO | null>(null);

  const {
    assignedZones,
    assignedUsers,
    fetchVehicleZones,
    assignZonesToVehicle,
    fetchVehicleUsers,
    // Puedes agregar lógica para usuarios si tienes endpoint de asignación
  } = useVehicleAssignments();

  const { showSnackbar } = useSnackbar();

  // Cargar zonas y usuarios disponibles al montar
  useEffect(() => {
    const fetchData = async () => {
      const zonesRes = await new ZoneService().getZones?.();
      setAllZones(zonesRes?.data || []);
      const usersRes = await new UserService().getUsers?.();
      setAllUsers(usersRes?.data || []);
    };
    fetchData();
  }, []);

  // Si editas, carga las asignaciones actuales
  useEffect(() => {
    if (isEditing && vehicleToEdit?.vehicle_id) {
      fetchVehicleZones(vehicleToEdit.vehicle_id);
      fetchVehicleUsers(vehicleToEdit.vehicle_id);
    }
  }, [isEditing, vehicleToEdit?.vehicle_id, fetchVehicleZones, fetchVehicleUsers]);

  // Actualiza los seleccionados cuando se cargan las asignaciones
  useEffect(() => {
    if (isEditing) {
      setSelectedZoneIds(assignedZones.map(z => z.zone_id));
      setSelectedUserIds(assignedUsers.map(u => u.id));
    }
  }, [assignedZones, assignedUsers, isEditing]);

  const initialValues = useMemo(
    () => getInitialValues(isEditing, vehicleToEdit),
    [isEditing, vehicleToEdit]
  );

  const form = useForm<CreateVehicleDTO>({
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: CreateVehicleDTO | FormData) => {
    if (isEditing && vehicleToEdit) {
      setPendingValues(values as CreateVehicleDTO);
      setShowUpdateConfirm(true);
      return;
    }
    try {
      let success = false;
      let vehicleId: number | undefined;
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      const created = await createVehicle(values);
      success = !!created;
      vehicleId = created?.vehicle_id;
      if (success && vehicleId) {
        await assignZonesToVehicle(vehicleId, selectedZoneIds, "Asignación desde formulario", true);
        await refreshVehicles();
        if (onSuccess) onSuccess("Vehículo creado correctamente.");
        showSnackbar("Vehículo creado correctamente.", "success");
        onCancel();
      } else {
        setError("Error al guardar el vehículo");
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el vehículo");
      showSnackbar(err?.message || "Error al guardar el vehículo", "error");
      console.error(err);
    }
  };

  // Confirmación de edición
  const handleConfirmUpdate = async () => {
    if (!pendingValues || !vehicleToEdit) return;
    try {
      const updated = await updateVehicle(vehicleToEdit.vehicle_id, pendingValues);
      if (updated) {
        await assignZonesToVehicle(vehicleToEdit.vehicle_id, selectedZoneIds, "Asignación desde formulario", true);
        await refreshVehicles();
        if (onSuccess) onSuccess("Vehículo editado correctamente.");
        showSnackbar("Vehículo editado correctamente.", "success");
        onCancel();
      }
    } catch (err: any) {
      setError(err?.message || "Error al actualizar el vehículo");
      showSnackbar(err?.message || "Error al actualizar el vehículo", "error");
      console.error(err);
    } finally {
      setShowUpdateConfirm(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <ItemForm<CreateVehicleDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={vehicleFields}
        class={classForm}
      />
      {error && <div className="error-message">{error}</div>}
      {isEditing && vehicleToEdit && (
        <VehicleZones vehicleId={vehicleToEdit.vehicle_id} isEditing={isEditing} />
      )}

      {isEditing && vehicleToEdit && (
        <VehicleUsers vehicleId={vehicleToEdit.vehicle_id} isEditing={isEditing} />
      )}
      <ModalUpdateConfirm
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={handleConfirmUpdate}
        content="móvil"
        genere="M"
      />
    </>
  );
};

export default VehicleForm;