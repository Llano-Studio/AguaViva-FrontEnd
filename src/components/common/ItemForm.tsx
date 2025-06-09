import React, { useRef } from 'react';
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
  type?: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'number' | 'date' | 'textarea' | 'file';
  options?: { label: string; value: string }[];
  validation?: FieldValidation;
  order?: number;
}

// Props del componente
interface ItemFormProps<T> {
  initialValues: T;
  onSubmit: (values: T | FormData) => void;
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
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<T>({
    defaultValues: initialValues as DefaultValues<T>
  });

  // Para preview de imagen (opcional)
  const filePreviews = fields
    .filter(f => f.type === "file")
    .reduce((acc, f) => {
      const file = watch(f.name as any) as FileList | undefined;
      acc[f.name as string] = file && file[0] ? URL.createObjectURL(file[0]) : null;
      return acc;
    }, {} as Record<string, string | null>);

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
      case 'file':
        return (
          <>
            <input
              type="file"
              {...register(field.name as any)}
              className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
              accept="image/*"
            />
            {filePreviews[field.name as string] && (
              <img
                src={filePreviews[field.name as string] as string}
                alt="preview"
                style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }}
              />
            )}
          </>
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

  // Si hay algún campo file, usamos FormData
  const hasFileField = fields.some(f => f.type === "file");

  const customSubmit = (data: any) => {
    if (hasFileField) {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      onSubmit(formData);
    } else {
      onSubmit(data);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(customSubmit)}
      className={`form ${classForm ? classForm+"-form" : ""}`}
      encType={hasFileField ? "multipart/form-data" : undefined}
    >
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