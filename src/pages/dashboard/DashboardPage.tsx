import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../components/common/DataTable";
import useOrders from "../../hooks/useOrders";
import useDeliveries from "../../hooks/useDeliveries";
import { orderTableColumns } from "../../config/orders/orderFieldsConfig";
import { deliveryColumns } from "../../config/deliveries/deliveryFieldsConfig";
import { orderModalConfig } from "../../config/orders/orderModalConfig";
import { deliveryModalConfig } from "../../config/deliveries/deliveryModalConfig";
import { Modal } from "../../components/common/Modal";
import "../../styles/css/pages/pages.css";
import "../../styles/css/pages/dashboard/dashboardPage.css";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Pedidos
  const { orders, fetchOrders, isLoading: isLoadingOrders, error: errorOrders } = useOrders();
  // Entregas
  const { deliveries, fetchDeliveries, isLoading: isLoadingDeliveries, error: errorDeliveries } = useDeliveries();

  // Modales de vista
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderToView, setOrderToView] = useState<any>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryToView, setDeliveryToView] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    fetchDeliveries();
    // eslint-disable-next-line
  }, []);

  // Handlers para ver detalles
  const handleViewOrder = (order: any) => {
    setOrderToView(order);
    setShowOrderModal(true);
  };

  const handleViewDelivery = (delivery: any) => {
    setDeliveryToView(delivery);
    setShowDeliveryModal(true);
  };

  const titlePage = "dashboard";

  return (
    <div className="dashboard-container flex flex-col items-center justify-start min-h-screen py-8">
      {/* Botones superiores */}
      <div className={`${titlePage+"-page-buttons-container"}`}>
        <button
          onClick={() => navigate("/clientes/nuevo-cliente")}
          className={`${titlePage+"-page-new-client-button"}`}
        >
           <img
              src="/assets/icons/huge-icon.svg"
              alt="Nuevo cliente"
              className={`${titlePage+"-page-new-client-button-icon"}`}
              style={{ display: "inline-block" }}
          />
          Nuevo cliente
        </button>
        <button
          onClick={() => navigate("/pedidos/nuevo-pedido")}
          className={`${titlePage+"-page-new-order-button"}`}
        >
          <img
            src="/assets/icons/huge-icon.svg"
            alt="Nuevo pedido"
            className={`${titlePage+"-page-new-order-button-icon"}`}
            style={{ display: "inline-block" }}
          />          
          Nuevo pedido
        </button>
      </div>

      {/* Tabla de pedidos */}
      <div className={`${titlePage+"-page-table-container"} ${titlePage+"-page-table-container-1"}`}>
        <h2 className={`${titlePage+"-page-table-title"} ${titlePage+"-page-table-title-1"}`}>Pedidos</h2>
        {errorOrders && <div className="text-red-500 p-2">{errorOrders}</div>}
        <div className="table-scroll">
          <DataTable
            data={orders.slice(0, 10).map(order => ({
              ...order,
              id: (order as any).order_id ?? (order as any).purchase_id,
            }))}
            columns={orderTableColumns}
            onView={handleViewOrder}
            // No pasar onEdit ni onDelete
            class="dashboard-orders"
          />
        </div>
        <button
          onClick={() => navigate("/pedidos")}
          className={`page-button-direction ${titlePage+"-page-button-direction"}`}
          >
          <img
              src="/assets/icons/pedidos.svg"
              alt="pedidos"
              className={`page-button-direction-icon ${titlePage+"-page-button-direction-icon"}`}
              style={{ display: "inline-block" }}
          />
              Ir a pedidos
        </button>
      </div>

      {/* Tabla de entregas */}
      <div className={`${titlePage+"-page-table-container"} ${titlePage+"-page-table-container-2"}`}>
        <h2 className={`${titlePage+"-page-table-title"} ${titlePage+"-page-table-title-2"}`}>Entregas</h2>
        {errorDeliveries && <div className="text-red-500 p-2">{errorDeliveries}</div>}
        <div className="table-scroll">
        <DataTable
          data={deliveries.slice(0, 10).map(delivery => ({
            ...delivery,
            id: delivery.order_id,
          }))}
          columns={deliveryColumns}
          onView={handleViewDelivery}
          // No pasar onEdit ni onDelete
          class="dashboard-deliveries"
        />
        </div>
        <button
          onClick={() => navigate("/entregas")}
          className={`page-button-direction ${titlePage+"-page-button-direction"}`}
          >
          <img
              src="/assets/icons/entregas.svg"
              alt="entregas"
              className={`page-button-direction-icon ${titlePage+"-page-button-direction-icon"}`}
              style={{ display: "inline-block" }}
          />
              Ir a entregas
        </button>
    
      </div>

      {/* Modal de vista pedido */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setOrderToView(null);
        }}
        title="Detalles del Pedido"
        class="dashboard-orders"
        config={orderModalConfig}
        data={orderToView}
      />

      {/* Modal de vista entrega */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => {
          setShowDeliveryModal(false);
          setDeliveryToView(null);
        }}
        title="Detalles de la Entrega"
        class="dashboard-deliveries"
        config={deliveryModalConfig}
        data={deliveryToView}
      />
    </div>
  );
};

export default DashboardPage;