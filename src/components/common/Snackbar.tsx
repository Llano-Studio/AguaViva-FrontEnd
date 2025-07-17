import React, { useEffect } from "react";
import "../../styles/css/components/common/snackbar.css";

interface SnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number; // en ms, por defecto 3000
  type?: "success" | "error" | "info";
}

const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  onClose,
  duration = 3000,
  type = "success",
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={`snackbar snackbar-${type}`}>
      {message}
    </div>
  );
};

export default Snackbar;