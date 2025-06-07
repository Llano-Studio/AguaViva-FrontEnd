import React from 'react';
import { useForm, RegisterOptions, DefaultValues } from 'react-hook-form';
import '../../styles/css/components/common/itemForm.css'

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
  type?: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'number' | 'date' | 'textarea';
  options?: { label: string; value: string }[];
  validation?: FieldValidation;
}

// Props del componente
interface ItemFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  onCancel?: () => void; 
  fields: Field<T>[];
  class?: string;
}

export function ItemForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  onCancel,
  fields,
  class: classForm
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
            className={`form-select ${classForm ? classForm+"-form-select" : ""}`}
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
            className={`form-checkbox ${classForm ? classForm+"-form-checkbox" : ""}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            {...register(field.name as any, validationRules)}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            {...register(field.name as any, validationRules)}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
          />
        );
      case 'textarea':
        return (
          <textarea
            {...register(field.name as any, validationRules)}
            className={`form-textarea ${classForm ? classForm+"-form-textarea" : ""}`}
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            {...register(field.name as any, validationRules)}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`form ${classForm ? classForm+"-form" : ""}`}>
      {fields.map((field) => {
        const fieldName = String(field.name);
        return (
          <div key={fieldName} className={`form-field ${classForm ? classForm+"-form-field" : ""}`}>
            <label className={`form-field-label ${classForm ? classForm+"-form-field-label" : ""}`}>
              {field.label}
            </label>
            {renderField(field)}
            {errors[fieldName] && (
              <p className={`form-field-error ${classForm ? classForm+"-form-field-error" : ""}`}>
                {/* @ts-ignore */}
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        );
      })}
      <div className={`form-actions ${classForm ? classForm+"-form-actions" : ""}`}>
        {onCancel && (
          <button
            type="button"
            className={`form-cancel ${classForm ? classForm+"-form-cancel" : ""}`}
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={`form-submit ${classForm ? classForm+"-form-submit" : ""}`}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}