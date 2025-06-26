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

interface VehicleFormProps {
  onCancel: () => void;
  isEditing: boolean;
  vehicleToEdit?: Vehicle | null;
  refreshVehicles: () => Promise<void>;
  class?: string;
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
}) => {
  const { createVehicle, updateVehicle } = useVehicles();
  const [error, setError] = useState<string | null>(null);

  // Para selects de zonas y usuarios
  const [allZones, setAllZones] = useState<Zone[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const {
    assignedZones,
    assignedUsers,
    fetchVehicleZones,
    assignZonesToVehicle,
    fetchVehicleUsers,
    // Puedes agregar lógica para usuarios si tienes endpoint de asignación
  } = useVehicleAssignments();

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
    if (isEditing && vehicleToEdit) {
      fetchVehicleZones(vehicleToEdit.vehicle_id);
      fetchVehicleUsers(vehicleToEdit.vehicle_id);
    }
  }, [isEditing, vehicleToEdit, fetchVehicleZones, fetchVehicleUsers]);

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
    try {
      let success = false;
      let vehicleId: number | undefined;
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      if (isEditing && vehicleToEdit) {
        success = await updateVehicle(vehicleToEdit.vehicle_id, values);
        vehicleId = vehicleToEdit.vehicle_id;
      } else {
        const created = await createVehicle(values);
        success = !!created;
        vehicleId = created?.vehicle_id;
      }
      if (success && vehicleId) {
        // Asignar zonas al vehículo
        await assignZonesToVehicle(vehicleId, selectedZoneIds, "Asignación desde formulario", true);
        // Aquí podrías agregar lógica para asignar usuarios si tienes el endpoint
        await refreshVehicles();
        onCancel();
      } else {
        setError("Error al guardar el vehículo");
      }
    } catch (err) {
      setError("Error al guardar el vehículo");
      console.error(err);
    }
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <ItemForm<CreateVehicleDTO>
        {...form}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        fields={vehicleFields}
        class={classForm}
      />
      <div style={{ margin: "1rem 0" }}>
        <label><b>Zonas asignadas:</b></label>
        <select
          multiple
          value={selectedZoneIds.map(String)}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions, o => Number(o.value));
            setSelectedZoneIds(options);
          }}
          style={{ width: "100%", minHeight: "80px" }}
        >
          {allZones.map(zone => (
            <option key={zone.zone_id} value={zone.zone_id}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ margin: "1rem 0" }}>
        <label><b>Usuarios asignados:</b></label>
        <select
          multiple
          value={selectedUserIds.map(String)}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions, o => Number(o.value));
            setSelectedUserIds(options);
          }}
          style={{ width: "100%", minHeight: "80px" }}
        >
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default VehicleForm;