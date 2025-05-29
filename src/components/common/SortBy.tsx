import React from "react";

interface SortByProps {
  active: boolean;
  direction: "asc" | "desc" | null;
  onClick: () => void;
}

const SortBy: React.FC<SortByProps> = ({ active, direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`ml-1 focus:outline-none ${active ? "text-blue-600" : "text-gray-400"}`}
    tabIndex={-1}
    aria-label="Ordenar"
  >
    {direction === "asc" && (
      <img src="/assets/icons/sort-asc.svg" alt="Ascendente" title="Ascendente" className="w-4 h-4" />
    )}
    {direction === "desc" && (
      <img src="/assets/icons/sort-desc.svg" alt="Descendente" title="Descendente" className="w-4 h-4" />
    )}
    {direction === null && (
      <img src="/assets/icons/sort-neutro.svg" alt="Sin orden" title="Sin orden" className="w-4 h-4" />
    )}
  </button>
);

export default SortBy;