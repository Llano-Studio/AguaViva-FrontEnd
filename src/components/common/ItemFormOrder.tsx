import React, { useRef } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import Select from "react-select";
import { Field } from '../../interfaces/Common';
import '../../styles/css/components/common/itemForm.css';
import SearchBarWithDropdown from './SearchBarWithDropdown';

// Props del componente
interface ItemFormOrderProps<T extends FieldValues> extends UseFormReturn<T> {
  onSubmit: (values: T | FormData) => void;
  onCancel?: () => void; 
  fields: Field<T>[];
  class?: string;
  onFieldChange?: (fieldName: string, value: any) => void;
  renderInputs?: (inputData: any, setInputData: any) => React.ReactNode;
  hideActions?: boolean;
  searchFieldProps?: Record<string, any>;
  selectFieldProps?: Record<string, any>;
}

export function ItemFormOrder<T extends FieldValues>({
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
  renderInputs,
  hideActions = false,
  searchFieldProps = {},
  selectFieldProps = {},
}: ItemFormOrderProps<T>) {
  const formRef = useRef<HTMLDivElement>(null);

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
        const selectProps = selectFieldProps[field.name as string] || {};
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
              if (selectProps.onChange) {
                selectProps.onChange(e);
              }
            }}
            value={selectProps.value !== undefined ? selectProps.value : (watch(field.name as any) ?? (isNumberSelect ? 0 : ""))}
            disabled={field.disabled}
            {...selectProps}
          >
            <option value="">Seleccionar...</option>
            {(selectProps.options || field.options || []).map((option: any) => (
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
        if (field.disabled) {
          return (
            <input
              type="number"
              value={watch(field.name as any) ?? ""}
              className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
              disabled
              readOnly
              tabIndex={-1}
            />
          );
        }
        return (
          <input
            type="number"
            {...register(field.name as any, validationRules)}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
          />
        );
      case 'date':
        if (field.disabled) {
          return (
            <input
              type="date"
              value={watch(field.name as any) ?? ""}
              className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
              disabled
              readOnly
              tabIndex={-1}
            />
          );
        }
        return (
          <input
            type="date"
            {...register(field.name as any, validationRules)}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
          />
        );
      case 'textarea':
        if (field.disabled) {
          return (
            <textarea
              value={watch(field.name as any) ?? ""}
              className={`form-textarea ${classForm ? classForm+"-form-textarea" : ""}`}
              disabled
              readOnly
              tabIndex={-1}
            />
          );
        }
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
        const options = field.options?.map(option => ({
          label: option.label,
          value: option.value
        })) || [];

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
      case 'search': {
        const searchProps = searchFieldProps[field.name as string] || {};
        return (
          <SearchBarWithDropdown
            {...searchProps}
            value={searchProps.value !== undefined ? searchProps.value : (watch(field.name as any) ?? "")}
            onChange={val => {
              let valueToSet: any = val;
              if (typeof watch(field.name as any) === "number" && val !== "") {
                valueToSet = Number(val);
              }
              setValue(field.name as any, valueToSet, { shouldValidate: true, shouldDirty: true });
              if (searchProps.onChange) searchProps.onChange(val);
            }}
            disabled={field.disabled} // <-- AGREGA ESTA LÍNEA
          />
        );
      }
      case 'time':
        if (field.disabled) {
          return (
            <input
              type="time"
              value={watch(field.name as any) ?? ""}
              className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
              disabled
              readOnly
              tabIndex={-1}
            />
          );
        }
        return (
          <input
            type="time"
            {...register(field.name as any, validationRules)}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
          />
        );
      default:
        if (field.disabled) {
          return (
            <input
              type={field.type || 'text'}
              value={watch(field.name as any) ?? ""}
              className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
              disabled
              readOnly
              tabIndex={-1}
            />
          );
        }
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
      // No se soporta FormData aquí, pero se deja por compatibilidad
      onSubmit(data);
    } else {
      onSubmit(data);
    }
  };

  return (
    <div
      ref={formRef}
      className={`form ${classForm ? classForm+"-form" : ""}`}
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
      {renderInputs && renderInputs({}, () => {})}
      {!hideActions && (
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
            type="button"
            className={`form-submit ${classForm ? classForm+"-form-submit" : ""}`}
            onClick={handleSubmit(customSubmit)}
          >
            Agregar artículo
          </button>
        </div>
      )}
    </div>
  );
}