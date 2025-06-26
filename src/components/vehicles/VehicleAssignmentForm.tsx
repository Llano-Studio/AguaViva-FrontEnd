import React, { useEffect, useState } from "react";
import { ItemForm } from "../common/ItemForm";
import { vehicleUserAssignmentFields } from "../../config/vehicles/vehicleAssignmentFieldsConfig";
import { useDependentLocationFields } from "../../hooks/useDependentLocationFields";
import { getDependentLocationOptions, handleDependentLocationChange } from "../../config/common/dependentLocationLogic";
import { UserService } from "../../services/UserService";
import useVehicleAssignments from "../../hooks/useVehicleAssignments";

interface VehicleAssignmentFormProps {
  vehicleId: number;
  onClose: () => void;
  refreshAssignments: () => Promise<void>;
  class?: string;
}

const VehicleAssignmentForm: React.FC<VehicleAssignmentFormProps> = ({
  vehicleId,
  onClose,
  refreshAssignments,
  class: classForm,
}) => {
  // Para usuarios
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Para zonas (pueden ser varias)
  const [zoneRows, setZoneRows] = useState([{ countryId: 0, provinceId: 0, localityId: 0, zoneId: 0 }]);

  const { assignZonesToVehicle } = useVehicleAssignments();

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRes = await new UserService().getUsers?.();
      setUserOptions(
        (usersRes?.data || []).map((u: any) => ({
          label: `${u.name} (${u.email})`,
          value: u.id,
        }))
      );
    };
    fetchUsers();
  }, []);

  // Handler para agregar una fila de zona
  const handleAddZoneRow = () => {
    setZoneRows([...zoneRows, { countryId: 0, provinceId: 0, localityId: 0, zoneId: 0 }]);
  };

  // Handler para cambiar una fila de zona
  const handleZoneRowChange = (idx: number, field: string, value: any) => {
    setZoneRows(rows =>
      rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  // Handler para eliminar una fila de zona
  const handleRemoveZoneRow = (idx: number) => {
    setZoneRows(rows => rows.filter((_, i) => i !== idx));
  };

  // Handler para asignar zonas y usuarios
  const handleSubmit = async () => {
    // Asignar zonas
    const zoneIds = zoneRows.map(row => row.zoneId).filter(z => !!z);
    if (zoneIds.length > 0) {
      await assignZonesToVehicle(vehicleId, zoneIds, "Asignación desde formulario", true);
    }
    // Asignar usuarios (usando UserService)
    if (selectedUserIds.length > 0) {
      const userService = new UserService();
      for (const userId of selectedUserIds) {
        await userService.assignVehiclesToUser(userId, {
          vehicleIds: [vehicleId],
          notes: "Asignación desde formulario",
          isActive: true,
        });
      }
    }
    await refreshAssignments();
    onClose();
  };

  return (
    <div className={classForm}>
      <h3>Asignar Zonas</h3>
      {zoneRows.map((row, idx) => {
        // Hooks dependientes para cada fila
        const {
          countries,
          provinces,
          localities,
          zones,
        } = useDependentLocationFields(row.countryId, row.provinceId, row.localityId, row.zoneId);

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
          row.countryId,
          row.provinceId,
          row.localityId
        );

        const handleFieldChange = handleDependentLocationChange<any>((field, value) =>
          handleZoneRowChange(idx, field, value)
        );

        return (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <ItemForm
              fields={[
                { name: "countryId", label: "País", type: "select", options: countryOptions, value: row.countryId, onChange: handleFieldChange, order: 1 },
                { name: "provinceId", label: "Provincia", type: "select", options: provinceOptions, value: row.provinceId, onChange: handleFieldChange, order: 2 },
                { name: "localityId", label: "Localidad", type: "select", options: localityOptions, value: row.localityId, onChange: handleFieldChange, order: 3 },
                { name: "zoneId", label: "Zona", type: "select", options: zoneOptions, value: row.zoneId, onChange: handleFieldChange, order: 4 },
              ]}
              onSubmit={() => {}}
              onCancel={() => {}}
              class={classForm}
              hideButtons
            />
            {zoneRows.length > 1 && (
              <button type="button" onClick={() => handleRemoveZoneRow(idx)}>-</button>
            )}
          </div>
        );
      })}
      <button type="button" onClick={handleAddZoneRow} style={{ marginBottom: 16 }}>Agregar otra zona</button>

      <h3>Asignar Usuarios</h3>
      <ItemForm
        fields={[
            {
            ...vehicleUserAssignmentFields[0],
            options: userOptions,
            value: selectedUserIds,
            onChange: (_: string, value: any) => setSelectedUserIds(value),
            name: "userIds", // fuerza a string
            },
        ]}
        onSubmit={handleSubmit}
        onCancel={onClose}
        class={classForm}
        />
    </div>
  );
};

export default VehicleAssignmentForm;