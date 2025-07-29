import React from "react";
import { useForm } from "react-hook-form";
import { ItemForm } from "../common/ItemForm";
import { Field } from "../../interfaces/Common";

interface VehicleUsersFormProps {
  userOptions: { label: string; value: number }[];
  vehicleId: number;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const fields: Field<any>[] = [
  {
    name: "userId",
    label: "Chofer",
    type: "select",
    options: [], // Se setea dinámicamente
    validation: { required: true },
    order: 0,
  },
  {
    name: "notes",
    label: "Notas",
    type: "textarea",
    validation: { required: false },
    order: 1,
  },
  {
    name: "isActive",
    label: "Activo",
    type: "checkbox",
    validation: { required: false },
    order: 2,
  },
];

const VehicleUsersForm: React.FC<VehicleUsersFormProps> = ({
  userOptions,
  vehicleId,
  onSubmit,
  onCancel,
  loading,
  error,
}) => {
  const form = useForm<any>({
    defaultValues: { isActive: true },
  });

  // Set options dinámicamente
  fields[0].options = userOptions;

  const handleSubmit = (values: any) => {
    onSubmit({
      vehicleIds: [vehicleId],
      notes: values.notes,
      isActive: values.isActive,
      userId: values.userId,
    });
  };

  return (
    <>
      <ItemForm
        {...form}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        class="vehicle-users"
      />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando...</div>}
    </>
  );
};

export default VehicleUsersForm;