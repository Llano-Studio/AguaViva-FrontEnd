import React, { useState, useEffect, useRef, forwardRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, placeholder, debounceMs = 800 }, ref) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    useEffect(() => {
      const handler = setTimeout(() => {
        onChange(inputValue);
      }, debounceMs);
      return () => clearTimeout(handler);
    }, [inputValue, onChange, debounceMs]);

    return (
      <input
        ref={ref}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder={placeholder || "Buscar..."}
        className="border px-3 py-2 rounded w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }
);

export default SearchBar;