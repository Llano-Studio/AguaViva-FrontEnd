import React from "react";
import ZoneForm from "../../components/zones/ZoneForm";
import { useNavigate } from "react-router-dom";
import "../../styles/css/pages/newPages.css";

const NewZonePage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-zone";

  return (
    <div className={`new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nueva Zona</h2>
      </div>
      <ZoneForm
        onCancel={() => navigate("/zonas")}
        isEditing={false}
        refreshZones={async () => {}}
        class={titlePage}
      />
    </div>
  );
};

export default NewZonePage;