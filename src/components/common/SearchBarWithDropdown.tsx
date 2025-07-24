import React, { useState, useEffect, forwardRef } from "react";
import '../../styles/css/components/common/searchBarWithDropdown.css';

interface SearchBarWithDropdownProps<T> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  class?: string;
  fetchOptions: (query: string) => Promise<T[]>;
  renderOption: (option: T) => React.ReactNode;
  onOptionSelect: (option: T) => void;
}

function SearchBarWithDropdownInner<T>(
  {
    value,
    onChange,
    placeholder,
    debounceMs = 800,
    class: classSearchBar,
    fetchOptions,
    renderOption,
    onOptionSelect,
  }: SearchBarWithDropdownProps<T>,
  ref: React.Ref<HTMLInputElement>
) {
  const [inputValue, setInputValue] = useState(value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) {
      setInputValue(value);
    }
  }, [value, dropdownOpen]);

  useEffect(() => {
    // Solo dispara onChange si el inputValue fue cambiado por el usuario, no por el prop value externo
    if (inputValue !== value) {
      const handler = setTimeout(() => {
        onChange(inputValue);
      }, debounceMs);
      return () => clearTimeout(handler);
    }
    // eslint-disable-next-line
  }, [inputValue]);

  // Fetch options when dropdown opens or input changes
  useEffect(() => {
    if (dropdownOpen) {
      setLoading(true);
      fetchOptions(inputValue)
        .then(setOptions)
        .finally(() => setLoading(false));
    }
  }, [dropdownOpen, inputValue, fetchOptions]);

  return (
    <div className={`search-bar-dropdown ${classSearchBar ? classSearchBar + "search-bar-dropdown" : ""}`} style={{ position: "relative" }}>
      <input
        ref={ref}
        type="text"
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
        }}
        placeholder={placeholder || "Buscar..."}
        className={`search-bar-dropdown-input ${classSearchBar ? classSearchBar + '-search-bar-dropdown-input' : ''}`}
      />
      <button
        type="button"
        className={`search-bar-dropdown-btn ${classSearchBar ? classSearchBar + '-search-bar-dropdown-btn' : ''}`}
      onClick={() => {
        setDropdownOpen(open => !open);
        setInputValue(""); // Limpiar el buscador al abrir/cerrar
        onChange("");      // Notificar al padre que el input está vacío
      }}
      >
        <img
          src="/assets/icons/arrow-down-blue.svg"
          alt="Desplegar"
          className={`search-bar-dropdown-img ${classSearchBar+'-search-bar-dropdown-img'}`}
        />
      </button>
      {dropdownOpen && (
        <div className="search-bar-dropdown-menu">
          {loading && <div className="search-bar-dropdown-loading">Cargando...</div>}
          {!loading && options.length === 0 && <div className="search-bar-dropdown-empty">Sin resultados</div>}
          {!loading && options.map((option, idx) => (
            <div
              key={idx}
              className="search-bar-dropdown-option"
              onClick={() => {
                onOptionSelect(option);
                setDropdownOpen(false);
              }}
            >
              {renderOption(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SearchBarWithDropdown = forwardRef(SearchBarWithDropdownInner) as <T>(
  props: SearchBarWithDropdownProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => ReturnType<typeof SearchBarWithDropdownInner>;

export default SearchBarWithDropdown;