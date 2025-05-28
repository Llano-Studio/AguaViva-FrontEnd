import React from "react";

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
      className={`
        fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transition-transform duration-300
        translate-x-0
      `}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Filtros</h2>
        <button onClick={onClose} className="text-2xl">&times;</button>
      </div>
      <div className="p-4 space-y-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block mb-1 font-medium">{field.label}</label>
            {field.type === "checkbox" && field.options && (
              <div className="flex flex-col gap-1">
                {field.options.map(opt => (
                  <label key={String(opt.value)} className="flex items-center gap-2">
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
        <div className="flex justify-between pt-2">
          <button onClick={onClear} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Limpiar</button>
          <button onClick={onApply} className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Aplicar</button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;