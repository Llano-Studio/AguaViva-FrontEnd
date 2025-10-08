import React from "react";
import "../../styles/css/components/common/spinnerLoading.css";

interface SpinnerLoadingProps {
  size?: number;       // px
  color?: string;      // CSS color
  className?: string;
  label?: string;      // opcional, texto accesible
}

const SpinnerLoading: React.FC<SpinnerLoadingProps> = ({ size = 60, className, label }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
  };

  return (
    <span className={["spinner-loading", className].filter(Boolean).join(" ")} style={style} role="status" aria-label={label || "Cargando"} />
  );
};

export default SpinnerLoading;