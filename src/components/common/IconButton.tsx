import React, { useId } from "react";
import "../../styles/css/components/common/iconButton.css";

interface IconButtonProps {
  onClick: () => void;
  icon: string;
  alt: string;
  className?: string;
  tooltip?: string;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  alt,
  className = "",
  tooltip,
  disabled = false,
}) => {
  const tooltipId = useId();
  return (
    <span className="icon-button-wrapper">
      <button
        onClick={onClick}
        className={`icon-button ${className ? className + "-icon-button" : ""}`}
        aria-label={tooltip || alt}
        aria-describedby={tooltip ? tooltipId : undefined}
        type="button"
        disabled={disabled}
      >
        <img src={icon} alt={alt} className="icon-button-img" />
      </button>
      {tooltip && (
        <span role="tooltip" id={tooltipId} className="icon-button-tooltip">
          {tooltip}
        </span>
      )}
    </span>
  );
};

export default IconButton;