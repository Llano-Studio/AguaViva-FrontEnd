import React from "react";
import VehicleForm from "../../components/vehicles/VehicleForm";
import { useNavigate } from "react-router-dom";
import useVehicles from "../../hooks/useVehicles";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/newPages.css";

const NewVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-vehicle";
  const { refreshVehicles } = useVehicles();
  const { showSnackbar } = useSnackbar();

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/moviles");
  };

  return (
    <div className={`table-scroll new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nuevo Vehículo</h2>
      </div>
      <VehicleForm
        onCancel={() => navigate("/moviles")}
        isEditing={false}
        refreshVehicles={async () => { await refreshVehicles(); }}
        class={titlePage}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default NewVehiclePage;