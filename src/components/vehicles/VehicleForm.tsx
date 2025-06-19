import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CreateVehicleDTO, Vehicle } from "../../interfaces/Vehicle";
import { ItemForm } from "../common/ItemForm";
import { vehicleFields } from "../../config/vehicles/vehicleFieldsConfig";
import useVehicles from "../../hooks/useVehicles";

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
      if (values instanceof FormData) {
        setError("No se admiten archivos en este formulario.");
        return;
      }
      if (isEditing && vehicleToEdit) {
        success = await updateVehicle(vehicleToEdit.vehicle_id, values);
      } else {
        success = await createVehicle(values);
      }
      if (success) {
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
    </>
  );
};

export default VehicleForm;