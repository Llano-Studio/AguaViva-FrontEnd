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
    const value = watch(f.name as any);
    // Verifica que value es un FileList (por estructura)
    if (
      value &&
      typeof value === "object" &&
      typeof (value as FileList).item === "function" &&
      value[0]
    ) {
      acc[f.name as string] = URL.createObjectURL(value[0]);
    } else if (typeof value === "string" && value.startsWith("http")) {
      acc[f.name as string] = value;
    } else {
      acc[f.name as string] = null;
    }
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

        const allOptions = (selectProps.options || field.options || []) as Array<{ label: string; value: any }>;
        const isNumberSelect = allOptions.length > 0 && typeof allOptions[0]?.value === "number";

        const selectValidationRules = { ...validationRules };
        if (isNumberSelect) {
          if ("pattern" in selectValidationRules) {
            delete (selectValidationRules as any).pattern;
          }
        }

        // DEFAULT: usar react-select salvo que se pida explícitamente nativo
        const explicitFlag = selectProps.useReactSelect ?? (field as any).useReactSelect;
        const useReactSelect = explicitFlag !== undefined ? Boolean(explicitFlag) : true; // <-- default true
        const menuMaxHeight = selectProps.menuMaxHeight ?? (field as any).menuMaxHeight ?? 240;
        const placeholderText =
          selectProps.placeholder ?? (field as any).placeholder ?? "Seleccionar...";

        if (useReactSelect) {
          const watched = watch(field.name as any);
          const controlledValue = selectProps.value !== undefined ? selectProps.value : watched;
          const current = allOptions.find(o => o.value === controlledValue) ?? null;

          return (
            <Select
              isDisabled={field.disabled}
              options={allOptions}
              value={current}
              placeholder={placeholderText}
              onChange={(opt: any) => {
                const v = opt ? opt.value : "";
                setValue(field.name as any, v as any, { shouldValidate: true, shouldDirty: true });
                if (onFieldChange) onFieldChange(field.name as string, v);
                if (selectProps.onChange) selectProps.onChange({ target: { value: v } });
              }}
              maxMenuHeight={menuMaxHeight}
              classNamePrefix="item-form-react-select"
              styles={{
                menu: (base) => ({ ...base, zIndex: 9999 }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: menuMaxHeight,
                  overflowY: "auto",
                }),
                control: (base) => ({ ...base, minHeight: "30px", fontSize: "12px" }),
              }}
            />
          );
        }

        // <select> nativo (fallback solo si useReactSelect=false)
        const watchedRaw = watch(field.name as any);
        const resolveValue = () => {
          const raw = selectProps.value !== undefined ? selectProps.value : watchedRaw;
          if (isNumberSelect) {
            if (raw === undefined || raw === null || raw === "" || Number.isNaN(raw as any)) {
              return "";
            }
            return String(raw);
          }
          return raw ?? "";
        };

        return (
          <select
            {...register(field.name as any, selectValidationRules)}
            className={`form-select ${classForm ? classForm + "-form-select" : ""}`}
            onChange={(e) => {
              const raw = e.target.value;
              const value = raw === "" ? "" : (isNumberSelect ? Number(raw) : raw);
              setValue(field.name as any, value as any, { shouldValidate: true, shouldDirty: true });
              if (onFieldChange) onFieldChange(field.name as string, value);
              if (selectProps.onChange) selectProps.onChange(e);
            }}
            value={resolveValue()}
            disabled={field.disabled}
            {...selectProps}
          >
            <option value="">{placeholderText}</option>
            {allOptions.map((option: any) => (
              <option key={String(option.value)} value={option.value}>
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
              style={filePreviews[field.name as string] ? { fontSize: 0 } : {}}
            />
            {filePreviews[field.name as string] && (
              <img 
                src={filePreviews[field.name as string] as string} 
                alt="Preview" 
                className="file-preview" 
                style={{ maxWidth: '140px', marginTop: '10px', marginBottom: '10px' }}
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

        const multiPlaceholder = (field as any).placeholder ?? "Seleccionar...";

        return (
          <Select
            isMulti
            options={options}
            value={currentValue}
            classNamePrefix="item-form-react-multi-select"
            onChange={selected => {
              const values = (selected as any[]).map(opt => opt.value);
              setValue(field.name as any, values as any, { shouldValidate: true, shouldDirty: true });
              if (onFieldChange) {
                onFieldChange(field.name as string, values);
              }
            }}
            placeholder={multiPlaceholder}
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