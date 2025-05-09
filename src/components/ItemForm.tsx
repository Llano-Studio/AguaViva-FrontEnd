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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

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
    <form onSubmit={handleSubmit}>
      {fields.map((field) => {
        const inputType = field.type || "text";
        const name = String(field.name);
        const value = values[field.name];

        return (
          <div key={name} style={{ marginBottom: "1rem" }}>
            <label>
              {field.label}
              {inputType === "checkbox" ? (
                <input
                  type="checkbox"
                  name={name}
                  checked={value}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={inputType}
                  name={name}
                  value={value}
                  onChange={handleChange}
                />
              )}
            </label>
            {errors[field.name] && (
              <div style={{ color: "red", fontSize: "0.85rem" }}>
                {errors[field.name]}
              </div>
            )}
          </div>
        );
      })}

      <button type="submit">Guardar</button>
    </form>
  );
}
