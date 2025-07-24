import React, { useState, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import SearchBarWithDropdown from "./SearchBarWithDropdown";
import "../../styles/css/components/common/addItem.css";

interface AddItemProps<T = any, D = any> {
  title: string;
  placeholder: string;
  onSearch: (query: string) => Promise<T[]>;
  onAdd: (item: T, data: D) => void;
  selectedItems: T[];
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string | number;
  getDisplayValue: (item: T) => string;
  renderInputs?: (data: D, setData: (data: D) => void) => React.ReactNode;
  initialInputData?: D;
}

export function AddItem<T = any, D = any>({
  title,
  placeholder,
  onSearch,
  onAdd,
  selectedItems,
  renderItem,
  getKey,
  getDisplayValue,
  renderInputs,
  initialInputData,
}: AddItemProps<T, D>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);
  const [inputData, setInputData] = useState<D>(initialInputData ?? ({} as D));
  const [showDropdown, setShowDropdown] = useState(false);

  const justSelectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipNextSearchRef = useRef(false);

  const fetchAllOptions = async () => {
    return onSearch(""); // Puedes personalizar esto según el módulo
  };

  // Búsqueda reactiva
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    let active = true;
    if (query.trim() === "") {
      setResults([]);
      setSelected(null);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    onSearch(query).then(found => {
      if (!active) return;
      const filtered = found.filter(
        item => !selectedItems.some(sel => getKey(sel) === getKey(item))
      );
      setResults(filtered);
      setShowDropdown(filtered.length > 0);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [query, onSearch, selectedItems, getKey]);

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelect = (item: T) => {
    setSelected(item);
    skipNextSearchRef.current = true;
    setQuery(getDisplayValue(item));
    setResults([]);
    setShowDropdown(false);
    justSelectedRef.current = true;
  };
  
const handleAdd = () => {
    if (selected) {
      if (renderInputs) {
        // Si hay inputs personalizados, pasa el objeto inputData completo
        onAdd(selected, inputData);
      } else {
        // Si no, pasa solo la cantidad (número)
        const quantity = (inputData as any)?.quantity ?? 1;
        onAdd(selected, quantity);
      }
      setQuery("");
      setResults([]);
      setSelected(null);
      setInputData(initialInputData ?? ({} as D));
      setShowDropdown(false);
    }
  };

  return (
    <div className="addItem-container" ref={containerRef} style={{ position: "relative" }}>
      <h4 className="addItem-title">{title}</h4>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div className="addItem-search-container">

          {/* Nuevo: botón para desplegar todas las opciones del módulo */}
          <SearchBarWithDropdown
            value={query}
            onChange={val => {
              setQuery(val);
              if (!justSelectedRef.current) {
                setSelected(null);
                setShowDropdown(true);
                justSelectedRef.current = false;
              }
            }}
            fetchOptions={fetchAllOptions}
            renderOption={renderItem}
            onOptionSelect={item => {
              handleSelect(item);
            }}
            placeholder={placeholder}
            class="addItem"
          />
          {showDropdown && results.length > 0 && (
            <ul className="addItem-dropdown">
              {results.map(item => (
                <li
                  key={getKey(item)}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    background: selected && getKey(selected) === getKey(item) ? "#e0e0e0" : undefined,
                  }}
                  onClick={() => handleSelect(item)}
                >
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
        {renderInputs ? (
          renderInputs(inputData, setInputData)
        ) : (
          <>
            <p className="addItem-quantity-label">Cantidad</p>
            <input
              type="number"
              min={1}
              value={(inputData as any)?.quantity ?? 1}
              onChange={e => setInputData({ ...(inputData as any), quantity: Number(e.target.value) })}
              className="addItem-quantity-input"
              placeholder="Cantidad"
            />
          </>
        )}
        <button
          type="button"
          disabled={!selected || (renderInputs ? false : ((inputData as any)?.quantity ?? 1) < 1)}
          onClick={handleAdd}
          className="addItem-button"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}