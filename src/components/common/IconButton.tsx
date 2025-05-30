import React from "react";
import "../../styles/css/components/common/iconButton.css";

interface IconButtonProps {
  onClick: () => void;
  icon: string; // Ruta al ícono
  alt: string; // Texto alternativo para accesibilidad
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, alt, className }) => (
  <button
    onClick={onClick}
    className={`icon-button ${className}-icon-button`}
  >
    <img src={icon} alt={alt} className="icon-button-img" />
  </button>
);

export default IconButton;
