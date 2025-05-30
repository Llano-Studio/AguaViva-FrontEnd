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
    className={`button ${active ? "text-blue-600" : "text-gray-400"}`}
    tabIndex={-1}
    aria-label="Ordenar"
  >
    {direction === "asc" && (
      <img src="/assets/icons/sort-asc.svg" alt="Ascendente" title="Ascendente" className="icon icon-1" />
    )}
    {direction === "desc" && (
      <img src="/assets/icons/sort-desc.svg" alt="Descendente" title="Descendente" className="icon icon-2" />
    )}
    {direction === null && (
      <img src="/assets/icons/sort-neutro.svg" alt="Sin orden" title="Sin orden" className="icon icon-3" />
    )}
  </button>
);

export default SortBy;