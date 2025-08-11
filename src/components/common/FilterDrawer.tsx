import React from "react";
import '../../styles/css/components/common/filterDrawer.css'

export interface FilterField {
  name: string;
  label: string;
  type: "select" | "checkbox" | "text" | "date";
  options?: { label: string; value: string | boolean }[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onApply: () => void;
  onClear: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  fields,
  values,
  onChange,
  onApply,
  onClear,
}) => {
  if (!isOpen) return null;

  const handleCheckboxChange = (fieldName: string, optionValue: string | boolean, checked: boolean) => {
    const prev = Array.isArray(values[fieldName]) ? values[fieldName] : [];
    let newValue;
    if (checked) {
      newValue = [...prev, optionValue];
    } else {
      newValue = prev.filter((v: any) => v !== optionValue);
    }
    onChange(fieldName, newValue);
  };

  const handleSelectChange = (fieldName: string, value: string) => {
    // Si el valor está vacío, enviar undefined para que se elimine del objeto filters
    if (value === "" || value === null || value === undefined) {
      onChange(fieldName, undefined);
    } else {
      onChange(fieldName, value);
    }
  };

  const handleTextChange = (fieldName: string, value: string) => {
    // Si el valor está vacío, enviar undefined para que se elimine del objeto filters
    if (value.trim() === "") {
      onChange(fieldName, undefined);
    } else {
      onChange(fieldName, value);
    }
  };

  const handleDateChange = (fieldName: string, value: string) => {
    // Si el valor está vacío, enviar undefined para que se elimine del objeto filters
    if (value === "" || value === null || value === undefined) {
      onChange(fieldName, undefined);
    } else {
      onChange(fieldName, value);
    }
  };

  return (
    <div className={`filter-container`}>
      <div className="filter-header">
        <button onClick={onClose} className="filter-button-close">
          <img
            src="/assets/icons/filter-close.svg"
            alt="Cerrar"
            className="filter-title-icon-close"
            style={{ display: "inline-block" }}
          />
        </button>
        <h2 className="filter-title">
          <img
            src="/assets/icons/filter-icon2.svg"
            alt="Filtrar"
            className="filter-title-img"
            style={{ display: "inline-block" }}
          />
          Filtrar
        </h2>
      </div>
      <div className="filter-content">
        {fields.map(field => (
          <div key={field.name} className="filter-label-container">
            <label className="filter-label">{field.label}</label>
            
            {field.type === "select" && field.options && (
              <select
                value={values[field.name] || ""}
                onChange={e => handleSelectChange(field.name, e.target.value)}
                className="filter-select"
              >
                <option value="">Seleccionar...</option>
                {field.options.map(opt => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === "checkbox" && field.options && (
              <div className="filter-checkbox-group">
                {field.options.map(opt => (
                  <label key={String(opt.value)} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={Array.isArray(values[field.name]) ? values[field.name].includes(opt.value) : false}
                      onChange={e => handleCheckboxChange(field.name, opt.value, e.target.checked)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
            
            {field.type === "date" && (
              <input
                type="date"
                value={values[field.name] || ""}
                onChange={e => handleDateChange(field.name, e.target.value)}
                className="filter-input"
              />
            )}
            
            {field.type === "text" && (
              <input
                type="text"
                value={values[field.name] || ""}
                onChange={e => handleTextChange(field.name, e.target.value)}
                className="filter-input"
              />
            )}
          </div>
        ))}
        <div className="filter-actions">
          <button onClick={onApply} className="filter-button-apply">Aplicar</button>
          <button onClick={onClear} className="filter-button-clear">Limpiar</button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;