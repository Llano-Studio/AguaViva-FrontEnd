import React, { useState, useEffect, forwardRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  class?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, placeholder, debounceMs = 800, class: classSearchBar }, ref) => {
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
      <div className={`relative w-full max-w-xs ${classSearchBar ? classSearchBar + "search-bar" : ""}`}>
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={placeholder || "Buscar..."}
          className="border px-3 py-2 rounded w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 search-bar"
        />
        <img
          src="/assets/icons/search-icon.svg"
          alt="Buscar"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
        />
      </div>
    );
  }
);

export default SearchBar;