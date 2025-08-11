import React, { createContext, useContext, useState, ReactNode } from "react";
import Snackbar from "../components/common/Snackbar"; // Importa el Snackbar normalmente

type SnackbarType = "success" | "error" | "info";

interface SnackbarContextProps {
  showSnackbar: (msg: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextProps>({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SnackbarType>("success");

  const showSnackbar = (msg: string, t: SnackbarType = "success") => {
    setMessage(msg);
    setType(t);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        message={message}
        onClose={() => setOpen(false)}
        type={type}
      />
    </SnackbarContext.Provider>
  );
};