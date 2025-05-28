import React from 'react';
import { useForm, RegisterOptions, DefaultValues } from 'react-hook-form';

// Validaciones opcionales
interface FieldValidation {
  required?: boolean;
  isEmail?: boolean;
  minLength?: number;
}

// Definición de un campo del formulario
export interface Field<T> {
  name: keyof T;
  label: string;
  type?: 'text' | 'email' | 'password' | 'select' | 'checkbox';
  options?: { label: string; value: string }[];
  validation?: FieldValidation;
}

// Props del componente
interface ItemFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  onCancel?: () => void; 
  fields: Field<T>[];
}

export function ItemForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  onCancel,
  fields,
}: ItemFormProps<T>) {
  const { register, handleSubmit, formState: { errors } } = useForm<T>({
    defaultValues: initialValues as DefaultValues<T>
  });

  const renderField = (field: Field<T>) => {
    const validationRules: RegisterOptions<T, any> = {};

    if (field.validation?.required) {
      validationRules.required = 'Este campo es requerido';
    }
    if (field.validation?.isEmail) {
      validationRules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Email inválido'
      };
    }
    if (field.validation?.minLength) {
      validationRules.minLength = {
        value: field.validation.minLength,
        message: `Mínimo ${field.validation.minLength} caracteres`
      };
    }

    switch (field.type) {
      case 'select':
        return (
          <select
            {...register(field.name as any, validationRules)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...register(field.name as any)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            {...register(field.name as any, validationRules)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        const fieldName = String(field.name);
        return (
          <div key={fieldName} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            {renderField(field)}
            {errors[fieldName] && (
              <p className="text-red-500 text-sm">
                {/* @ts-ignore */}
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );
      })}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}