import React from "react";

interface IconButtonProps {
  onClick: () => void;
  icon: string; // Ruta al ícono
  alt: string; // Texto alternativo para accesibilidad
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, alt, className }) => (
  <button
    onClick={onClick}
    className={`p-2 hover:opacity-80 transition-opacity ${className}`}
  >
    <img src={icon} alt={alt} className="w-5 h-5" />
  </button>
);

export default IconButton;
