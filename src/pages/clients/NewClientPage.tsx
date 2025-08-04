import React from "react";
import ClientForm from "../../components/clients/ClientForm";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/newPages.css";

const NewClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const titlePage = "new-client";

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/clientes");
  };

  return (
    <div className={`table-scroll new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nuevo Cliente</h2>
      </div>
      <ClientForm
        onCancel={() => navigate("/clientes")}
        isEditing={false}
        refreshClients={async () => {}}
        class={titlePage}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default NewClientPage;