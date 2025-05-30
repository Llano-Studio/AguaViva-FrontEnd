import React from "react";
import "../../styles/css/components/common/sortBy.css";

interface SortByProps {
  active: boolean;
  direction: "asc" | "desc" | null;
  onClick: () => void;
}

const SortBy: React.FC<SortByProps> = ({ active, direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`sortBy-button`}
    tabIndex={-1}
    aria-label="Ordenar"
  >
    {direction === "asc" && (
      <img src="/assets/icons/sort-asc.svg" alt="Ascendente" title="Ascendente" className="sortBy-icon sortBy-icon-1" />
    )}
    {direction === "desc" && (
      <img src="/assets/icons/sort-desc.svg" alt="Descendente" title="Descendente" className="sortBy-icon sortBy-icon-2" />
    )}
    {direction === null && (
      <img src="/assets/icons/sort-neutro.svg" alt="Sin orden" title="Sin orden" className="sortBy-icon sortBy-icon-3" />
    )}
  </button>
);

export default SortBy;