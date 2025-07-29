import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RouteSheetForm from "../../components/routeSheets/RouteSheetForm";
import useRouteSheets from "../../hooks/useRouteSheets";
import { UserService } from "../../services/UserService";
import { VehicleService } from "../../services/VehicleService";
import { OrderService } from "../../services/OrderService";
import { useSnackbar } from "../../context/SnackbarContext";

const NewRouteSheetPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { createRouteSheet, isLoading, error } = useRouteSheets();

  const [driverOptions, setDriverOptions] = useState<{ label: string; value: number }[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<{ label: string; value: number }[]>([]);
  const [orderOptions, setOrderOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    // Traer choferes
    new UserService().getUsers({ role: "DRIVERS" }).then(res => {
      setDriverOptions(res.data.map((u: any) => ({
        label: u.name + " (" + u.email + ")",
        value: u.id,
      })));
    });
    // Traer vehículos
    new VehicleService().getVehicles().then(res => {
      setVehicleOptions(res.data.map((v: any) => ({
        label: v.name + " (" + v.code + ")",
        value: v.vehicle_id,
      })));
    });
    // Traer pedidos
    new OrderService().getOrders().then(res => {
      setOrderOptions(res.data.map((o: any) => ({
        label: `#${o.order_id} - ${o.customer?.name ?? ""}`,
        value: o.order_id,
      })));
    });
  }, []);

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/hojas-de-ruta");
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
    <div className="new-page-container route-sheet-page-container">
      <div className="new-page-header route-sheet-page-header">
        <button
          onClick={() => navigate(-1)}
          className="new-page-button-cancel route-sheet-page-button-cancel"
        >
          <img src="/assets/icons/back.svg" alt="Volver" className="new-page-icon-cancel route-sheet-page-icon-cancel" />
        </button>
        <h2 className="new-page-title route-sheet-page-title">Nueva Hoja de Ruta</h2>
      </div>
      <RouteSheetForm
        driverOptions={driverOptions}
        vehicleOptions={vehicleOptions}
        orderOptions={orderOptions}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/hojas-de-ruta")}
        loading={isLoading}
        error={error}
        className="route-sheet-form"
      />
    </div>
  );
};

export default NewRouteSheetPage;