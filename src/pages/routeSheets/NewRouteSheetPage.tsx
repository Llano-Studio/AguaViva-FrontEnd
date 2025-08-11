import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {RouteSheetForm} from "../../components/routeSheets/RouteSheetForm";
import useRouteSheets from "../../hooks/useRouteSheets";
import { UserService } from "../../services/UserService";
import { VehicleService } from "../../services/VehicleService";
import { OrderService } from "../../services/OrderService";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/newPages.css";

const NewRouteSheetPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { createRouteSheet, isLoading, error } = useRouteSheets();

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/entregas");
  };

  const handleSubmit = async (values: any) => {
    try {
      await createRouteSheet(values);
      handleSuccess("Hoja de ruta creada correctamente");
    } catch (e) {
      // El error ya se muestra en el formulario
    }
  };

  return (
    <div className="table-scroll new-page-container route-sheet-page-container">
      <div className="new-page-header route-sheet-page-header">
        <button
          onClick={() => navigate(-1)}
          className="new-page-button-cancel route-sheet-page-button-cancel"
        >
          <img src="/assets/icons/back.svg" alt="Volver" className="new-page-icon-cancel route-sheet-page-icon-cancel" />
        </button>
        <h2 className="new-page-title route-sheet-page-title">Generar hoja de ruta</h2>
      </div>
      <RouteSheetForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/entregas")}
        loading={isLoading}
        error={error}
        className="route-sheet-form"
      />
    </div>
  );
};

export default NewRouteSheetPage;