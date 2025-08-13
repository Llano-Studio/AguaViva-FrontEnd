import React, { useState, useEffect, useRef, forwardRef } from "react";
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
  disabled?: boolean;
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
    disabled = false,
  }: SearchBarWithDropdownProps<T>,
  ref: React.Ref<HTMLInputElement>
) {
  const [inputValue, setInputValue] = useState(value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFetchedGeneral, setHasFetchedGeneral] = useState(false);
  

  // Controla el bloqueo del input
  useEffect(() => {
    if (dropdownOpen) {
      setBlocked(false);
    } else if (inputValue) {
      setBlocked(true);
    } else {
      setBlocked(disabled);
    }
  }, [inputValue, disabled, dropdownOpen]);

  // Sincroniza el valor externo cuando se cierra el dropdown
  useEffect(() => {
    if (!dropdownOpen) {
      setInputValue(value);
    }
  }, [value, dropdownOpen]);

  // Debounce para onChange
  useEffect(() => {
    if (inputValue !== value) {
      const handler = setTimeout(() => {
        onChange(inputValue);
      }, debounceMs);
      return () => clearTimeout(handler);
    }
  }, [inputValue, value, onChange, debounceMs]);

  // Solo busca cuando el input cambia y tiene valor
  useEffect(() => {
    if (inputValue) {
      setLoading(true);
      fetchOptions(String(inputValue))
        .then(setOptions)
        .finally(() => setLoading(false));
      setHasFetchedGeneral(false); // resetea el flag si el usuario escribe
    }
    // No agregues lógica para dropdownOpen aquí
  }, [inputValue, fetchOptions]);


  useEffect(() => {
    if (dropdownOpen && !inputValue && !hasFetchedGeneral) {
      setLoading(true);
      fetchOptions("")
        .then(setOptions)
        .finally(() => setLoading(false));
      setHasFetchedGeneral(true);
    }
    if (!dropdownOpen && !inputValue) {
      setOptions([]);
      setLoading(false);
      setHasFetchedGeneral(false);
    }
  }, [dropdownOpen, inputValue, fetchOptions, hasFetchedGeneral]);



  // // Fetch de opciones: busca normalmente o fetch general si abres el dropdown vacío
  // useEffect(() => {
  //   // Si el input tiene valor, busca normalmente
  //   if (inputValue) {
  //     setLoading(true);
  //     fetchOptions(String(inputValue))
  //       .then(setOptions)
  //       .finally(() => setLoading(false));
  //     setHasFetchedGeneral(false); // resetea el flag si el usuario escribe
  //     return;
  //   }

  //   // Si el input está vacío y el dropdown está abierto, solo fetch si no lo hicimos antes
  //   if (dropdownOpen && !inputValue && !hasFetchedGeneral) {
  //     setLoading(true);
  //     fetchOptions("")
  //       .then(setOptions)
  //       .finally(() => setLoading(false));
  //     setHasFetchedGeneral(true);
  //     return;
  //   }

  //   // Si el input está vacío y el dropdown está cerrado, limpia opciones y flag
  //   if (!dropdownOpen && !inputValue) {
  //     setOptions([]);
  //     setLoading(false);
  //     setHasFetchedGeneral(false);
  //   }
  // }, [inputValue, dropdownOpen, fetchOptions, hasFetchedGeneral]);

  // Focus automático al abrir el dropdown
  useEffect(() => {
    if (dropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dropdownOpen]);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div ref={containerRef} className={`search-bar-dropdown ${classSearchBar ? classSearchBar + "search-bar-dropdown" : ""}`} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          setDropdownOpen(true);
        }}
        placeholder={placeholder || "Buscar..."}
        className={`search-bar-dropdown-input ${classSearchBar ? classSearchBar + '-search-bar-dropdown-input' : ''}`}
        disabled={blocked} 
      />
      <button
        type="button"
        className={`search-bar-dropdown-btn ${classSearchBar ? classSearchBar + '-search-bar-dropdown-btn' : ''}`}
        onClick={() => {
          setDropdownOpen(open => !open);
          setInputValue(""); 
          onChange("");
          setBlocked(true);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0); 
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