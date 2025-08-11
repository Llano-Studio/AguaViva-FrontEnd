import React, { useState } from "react";
import OrderForm from "../../components/orders/OrderForm";
import OrderOneOffForm from "../../components/orders/OrderOneOffForm";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../context/SnackbarContext";
import useOrders from "../../hooks/useOrders";
import useOrdersOneOff from "../../hooks/useOrdersOneOff";
import "../../styles/css/pages/newPages.css";
import "../../styles/css/pages/orders/newOrderPage.css";

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { createOrder } = useOrders();
  const { createOrder: createOrderOneOff } = useOrdersOneOff();
  const [activeTab, setActiveTab] = useState<"ORDER" | "ONE_OFF">("ORDER");
  const titlePage = "new-order";

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/pedidos");
  };

  return (
    <div className={`table-scroll new-page-container ${titlePage}-page-container`}>
      <div className={`new-page-header ${titlePage}-page-header`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage}-page-button-cancel`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage}-page-icon-cancel`} />
        </button>
        <h2 className={`new-page-title ${titlePage}-page-title`}>Nuevo Pedido</h2>
      </div>
      <div className="tabs-form">
      <div className="tabs">
        <button onClick={() => setActiveTab("ORDER")} className={activeTab === "ORDER" ? "active" : ""}>Pedido Regular</button>
        <button onClick={() => setActiveTab("ONE_OFF")} className={activeTab === "ONE_OFF" ? "active" : ""}>Compra Única</button>
      </div>
      {activeTab === "ORDER" && (
        <OrderForm
          onSubmit={createOrder}
          onCancel={() => navigate("/pedidos")}
          isEditing={false}
          refreshOrders={async () => {}}
          class={activeTab === "ORDER" ? `order-form-radius ${titlePage}` : titlePage}
          onSuccess={handleSuccess}
        />
      )}
      {activeTab === "ONE_OFF" && (
        <OrderOneOffForm
          onSubmit={async (orderData) => {
            try {
              await createOrderOneOff(orderData);
              return true;
            } catch {
              return false;
            }
          }}
          onCancel={() => navigate("/pedidos")}
          isEditing={false}
          refreshOrders={async () => {}}
          class={titlePage}
          onSuccess={handleSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default NewOrderPage;