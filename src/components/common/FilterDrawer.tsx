import React from "react";
import '../../styles/css/components/common/filterDrawer.css'
interface FilterField {
  name: string;
  label: string;
  type: "select" | "checkbox";
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
  if (!isOpen) return null; // <--- Esto oculta completamente el drawer

  // Helper para manejar arrays de checkbox
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

  return (
    <div
      className={`filter-container`}
    >
      <div className="filter-header">
        <h2 className="filter-title">
          <img
            src="/assets/icons/filter-icon2.svg"
            alt="Filtrar"
            className="filter-title-img"
            style={{ display: "inline-block" }}
          />
          Filtrar
        </h2>
        <button onClick={onClose} className="filter-button-close">
          <img
            src="/assets/icons/filter-close.svg"
            alt="Cerrar"
            className="w-5 h-5"
            style={{ display: "inline-block" }}
          />
        </button>
      </div>
      <div className="filter-content">
        {fields.map(field => (
          <div key={field.name}>
            <label className="filter-label">{field.label}</label>
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
          </div>
        ))}
        <div className="filter-actions">
          <button onClick={onClear} className="filter-button-clear">Limpiar</button>
          <button onClick={onApply} className="filter-button-apply">Aplicar</button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;