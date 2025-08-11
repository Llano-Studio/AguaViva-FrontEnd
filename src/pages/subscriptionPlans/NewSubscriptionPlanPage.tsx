import React from "react";
import SubscriptionPlanForm from "../../components/subscriptionPlans/SubscriptionPlanForm";
import { useNavigate } from "react-router-dom";
import useSubscriptionPlans from "../../hooks/useSubscriptionPlans";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/newPages.css";

const NewSubscriptionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-subscription-plan";
  const { refreshPlans } = useSubscriptionPlans();
  const { showSnackbar } = useSnackbar();

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/abonos");
  };

  return (
    <div className={`table-scroll new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nuevo Abono</h2>
      </div>
      <SubscriptionPlanForm
        onCancel={() => navigate("/abonos")}
        isEditing={false}
        refreshPlans={async () => { await refreshPlans(); }}
        class={titlePage}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default NewSubscriptionPlanPage;