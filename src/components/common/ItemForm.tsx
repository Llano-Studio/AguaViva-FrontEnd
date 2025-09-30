import React, { useRef } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import Select from "react-select";
import { Field } from '../../interfaces/Common';
import '../../styles/css/components/common/itemForm.css';
import SearchBarWithDropdown from './SearchBarWithDropdown';
import { formatCUIT } from "../../utils/formatCUIT";

// Props del componente
interface ItemFormProps<T extends FieldValues> extends UseFormReturn<T> {
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
  renderInputs,
  hideActions = false,
  searchFieldProps = {},
  selectFieldProps = {},
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
    // NUEVO: reglas min/max para RHF en numéricos
    if (field.type === 'number') {
      if (field.validation?.min !== undefined) {
        validationRules.min = {
          value: field.validation.min,
          message: `Mínimo ${field.validation.min}`,
        };
      }
      if (field.validation?.max !== undefined) {
        validationRules.max = {
          value: field.validation.max,
          message: `Máximo ${field.validation.max}`,
        };
      }
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

        // NUEVO: límites y clamping
        const minVal = field.validation?.min as number | undefined;
        const maxVal = field.validation?.max as number | undefined;
        const stepVal = (field.validation as any)?.step ?? 1;

        const clampNumber = (raw: string) => {
          if (raw === "") return raw;
          let n = Number(raw);
          if (Number.isNaN(n)) return "";
          if (minVal !== undefined && n < minVal) n = minVal;
          if (maxVal !== undefined && n > maxVal) n = maxVal;
          return String(n);
        };

        return (
          <input
            type="number"
            inputMode="numeric"
            min={minVal !== undefined ? minVal : undefined}
            max={maxVal !== undefined ? maxVal : undefined}
            step={stepVal}
            {...register(field.name as any, { ...validationRules, valueAsNumber: true })}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
            onInput={(e) => {
              const input = e.currentTarget;
              const clamped = clampNumber(input.value);
              if (clamped !== input.value) {
                input.value = clamped;
              }
            }}
            onBlur={(e) => {
              const input = e.currentTarget;
              const clamped = clampNumber(input.value);
              if (clamped !== input.value) {
                input.value = clamped;
              }
            }}
            onKeyDown={(e) => {
              const disallowed = ['e', 'E', '+'];
              const allowMinus = minVal === undefined || minVal < 0;
              if (disallowed.includes(e.key)) e.preventDefault();
              if (!allowMinus && e.key === '-') e.preventDefault();
              // si step es entero, bloqueamos decimales
              if (Number(stepVal) === 1 && e.key === '.') e.preventDefault();
            }}
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
          <div className={`form-file-container ${classForm ? classForm+"-form-file-container" : ""}`}>
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
          />
        );
      }

      case 'taxId': {
        const reg = register(field.name as any, {
          ...validationRules,
          pattern: {
            value: /^\d{2}-\d{8}-\d{1}$/,
            message: "Formato inválido. Use XX-XXXXXXXX-X",
          },
        });

        if (field.disabled) {
          return (
            <input
              type="text"
              value={watch(field.name as any) ?? ""}
              className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
              disabled
              readOnly
              tabIndex={-1}
              placeholder={(field as any).placeholder || "XX-XXXXXXXX-X"}
            />
          );
        }

        return (
          <input
            type="text"
            {...reg}
            className={`form-input ${classForm ? classForm+"-form-input" : ""}`}
            placeholder={(field as any).placeholder || "XX-XXXXXXXX-X"}
            inputMode="numeric"
            autoComplete="off"
            maxLength={13} // 11 dígitos + 2 guiones
            onKeyDown={(e) => {
              const ctrl = e.ctrlKey || e.metaKey;
              const allowedCtrl = ['a','c','v','x'];
              const navigation = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
              if (ctrl && allowedCtrl.includes(e.key.toLowerCase())) return;
              if (navigation.includes(e.key)) return;
              // Solo dígitos (los guiones los agrega el formateador)
              if (!/^[0-9]$/.test(e.key)) e.preventDefault();
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = (e.clipboardData || (window as any).clipboardData).getData('text');
              const formatted = formatCUIT(text);
              (e.currentTarget as HTMLInputElement).value = formatted;
              reg.onChange({ target: { name: field.name, value: formatted } });
              if (onFieldChange) onFieldChange(field.name as string, formatted);
            }}
            onChange={(e) => {
              const formatted = formatCUIT(e.target.value);
              e.target.value = formatted;
              reg.onChange(e);
              if (onFieldChange) onFieldChange(field.name as string, formatted);
            }}
          />
        );
      }


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
      {/* Renderiza inputs custom si se pasan como prop */}
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
            type="submit"
            className={`form-submit ${classForm ? classForm+"-form-submit" : ""}`}
          >
            Guardar
          </button>
        </div>
      )}
    </form>
  );
}