import React, { useRef } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import '../../styles/css/components/common/itemForm.css';
import Select from "react-select";

// Validaciones opcionales
interface FieldValidation {
  required?: boolean;
  isEmail?: boolean;
  minLength?: number;
}

// Definición de un campo del formulario
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "file"
  | "date"
  | "textarea"
  | "password"
  | "email"
  | "multiselect"
  | "time";

export interface Field<T> {
  name: keyof T | string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string | number }[];
  validation?: FieldValidation;
  order?: number;
  defaultValue?: any;
  multiple?: boolean;
  value?: any;
  onChange?: (name: string, value: any) => void;
}

// Props del componente
interface ItemFormProps<T extends FieldValues> extends UseFormReturn<T> {
  onSubmit: (values: T | FormData) => void;
  onCancel?: () => void; 
  fields: Field<T>[];
  class?: string;
  onFieldChange?: (fieldName: string, value: any) => void;
}

export function ItemForm<T extends FieldValues>({
  onSubmit,
  onCancel,
  fields,
  class: classForm,
  onFieldChange,
  register,
  handleSubmit,
  formState: { errors },
  setValue,
  watch,
}: ItemFormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);

  // Para preview de imagen (opcional)
  const filePreviews = fields
    .filter(f => f.type === "file")
    .reduce((acc, f) => {
      const file = watch(f.name as any) as FileList | undefined;
      acc[f.name as string] = file && file[0] ? URL.createObjectURL(file[0]) : null;
      return acc;
    }, {} as Record<string, string | null>);

  const renderField = (field: Field<T>) => {
    const validationRules: any = {};

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
      case 'select': {
        const isNumberSelect = field.options && typeof field.options[0]?.value === "number";
        const selectValidationRules = { ...validationRules };
        if (isNumberSelect) {
          selectValidationRules.valueAsNumber = true;
          if ('pattern' in selectValidationRules) {
            delete selectValidationRules.pattern;
          }
        }

        return (
          <select
            {...register(field.name as any, selectValidationRules)}
            className={`form-select ${classForm ? classForm+"-form-select" : ""}`}
            onChange={e => {
              const value = isNumberSelect
                ? (e.target.value === "" ? 0 : Number(e.target.value))
                : e.target.value;
              setValue(field.name as any, value as any, { shouldValidate: true, shouldDirty: true });
              if (onFieldChange) {
                onFieldChange(field.name as string, value);
              }
            }}
            value={watch(field.name as any) ?? (isNumberSelect ? 0 : "")}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(option => (
              <option 
                key={option.value} 
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      }
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
          <div>
            <input
              type="file"
              {...register(field.name as any, validationRules)}
              className={`form-file ${classForm ? classForm+"-form-file" : ""}`}
            />
            {filePreviews[field.name as string] && (
              <img 
                src={filePreviews[field.name as string] as string} 
                alt="Preview" 
                className="file-preview" 
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            )}
          </div>
        );
      case 'multiselect':
        // Adaptar las opciones al formato que espera react-select
        const options = field.options?.map(option => ({
          label: option.label,
          value: option.value
        })) || [];

        // Forzar a array para evitar error de TS
        const watchedValue = watch(field.name as any);
        const currentValue = ((Array.isArray(watchedValue) ? watchedValue : []) as any[])
          .map((val: any) => options.find(opt => opt.value === val))
          .filter(Boolean);

        return (
          <Select
            isMulti
            options={options}
            value={currentValue}
            classNamePrefix="react-select"
            onChange={selected => {
              const values = (selected as any[]).map(opt => opt.value);
              setValue(field.name as any, values as any, { shouldValidate: true, shouldDirty: true });
              if (onFieldChange) {
                onFieldChange(field.name as string, values);
              }
            }}
            placeholder="Seleccionar uno o más días"
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

  // Si hay algún campo file, usamos FormData
  const hasFileField = fields.some(f => f.type === "file");

  const customSubmit = (data: any) => {
    if (hasFileField) {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);

      // Asegura que los checkboxes estén presentes como "true"/"false"
      fields.forEach((field) => {
        if (field.type === "checkbox") {
          formData.set(field.name as string, data[field.name] ? "true" : "false");
        }
      });

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
      autoComplete="off"
    >
      {fields.map((field) => {
        const fieldName = String(field.name);
        return (
          <div key={fieldName} className={`form-field ${classForm ? classForm+"-form-field" : ""}`}>
            <label className={`form-label ${classForm ? classForm+"-form-label" : ""}`}>
              {field.label}
              {field.validation?.required && <span className="required-mark">*</span>}
            </label>
            {renderField(field)}
            {errors[fieldName] && (
              <span className={`form-error ${classForm ? classForm+"-form-error" : ""}`}>
                {errors[fieldName]?.message as string}
              </span>
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