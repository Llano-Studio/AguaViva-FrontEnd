import React, { useState, useEffect, forwardRef } from "react";
import '../../styles/css/components/common/searchBar.css';

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
      <div className={`search-bar ${classSearchBar ? classSearchBar + "search-bar" : ""}`}>
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={placeholder || "Buscar..."}
          className={`search-bar-input ${classSearchBar+'-search-bar-input'}`}
        />
        <img
          src="/assets/icons/search-icon.svg"
          alt="Buscar"
          className={`search-bar-img ${classSearchBar+'-search-bar-img'}`}
        />
      </div>
    );
  }
);

export default SearchBar;