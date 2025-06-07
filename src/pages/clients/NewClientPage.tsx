import React from "react";
import ClientForm from "../../components/clients/ClientForm";
import { useNavigate } from "react-router-dom";
import "../../styles/css/pages/newPages.css";

const NewClientPage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-client";

  return (
    <div className={`new-page-container ${titlePage+"-page-container"}`}>
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
      />
    </div>
  );
};

export default NewClientPage;