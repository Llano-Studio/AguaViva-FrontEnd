import React from "react";
import "../../styles/css/components/common/paginationControls.css";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  start: number;
  end: number;
  total: number;
  label?: string; // Ejemplo: "clientes"
  className?: string;
}

const getPageNumbers = (page: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
  }
  return pages;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  onPageChange,
  start,
  end,
  total,
  label = "elementos",
  className = "",
}) => {
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className={`pagination ${className}`}>
      <div className={`pagination-legend ${className && className + "-legend"}`}>
        Mostrando {end > total ? total : end} de {total} {label}
      </div>
      <div className={`pagination-controls ${className && className + "-controls"}`}>
        <button
          className="pagination-botton-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          &lt;
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={p}
              className={`pagination-button${page === p ? " bg-[#403A92] text-white" : " bg-[#FFFFFF] hover:bg-gray-300"}`}
              onClick={() => onPageChange(Number(p))}
              disabled={page === p}
            >
              {p}
            </button>
          )
        )}
        <button
          className="pagination-button-next"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;