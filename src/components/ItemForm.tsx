import React, { useState } from "react";

// Validaciones opcionales
interface FieldValidation {
  required?: boolean;
  isEmail?: boolean;
  minLength?: number;
}

export interface Field<T> {
  name: keyof T;
  label: string;
  type?: string;
  validation?: FieldValidation;
  options?: { label: string; value: string | number }[]; // Para selects
}

interface ItemFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  fields: Field<T>[];
}

export function ItemForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  fields,
}: ItemFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};

    fields.forEach(({ name, validation }) => {
      const value = values[name];

      if (!validation) return;

      if (validation.required && !value) {
        newErrors[name] = "Este campo es obligatorio";
      }

      if (validation.isEmail && value && !/^\S+@\S+\.\S+$/.test(value)) {
        newErrors[name] = "El email no es válido";
      }

      if (validation.minLength && value && value.length < validation.minLength) {
        newErrors[name] = `Debe tener al menos ${validation.minLength} caracteres`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-500 p-4 rounded-xl shadow-md max-w-xl">
      {fields.map((field) => {
        const inputType = field.type || "text";
        const name = String(field.name);
        const value = values[field.name];

        return (
          <div key={name} className="flex flex-col">
            <label htmlFor={name} className="mb-1 font-medium text-gray-700">
              {field.label}
            </label>

            {inputType === "select" && field.options ? (
              <select
                name={name}
                value={value}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : inputType === "checkbox" ? (
              <input
                type="checkbox"
                name={name}
                checked={value}
                onChange={handleChange}
                className="h-4 w-4"
              />
            ) : (
              <input
                type={inputType}
                name={name}
                value={value}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {errors[field.name] && (
              <span className="text-red-600 text-sm mt-1">{errors[field.name]}</span>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Guardar
      </button>
    </form>
  );
}
