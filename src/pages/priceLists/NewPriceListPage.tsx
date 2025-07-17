import React from "react";
import PriceListForm from "../../components/priceLists/PriceListForm";
import { useNavigate } from "react-router-dom";
import { usePriceLists } from "../../hooks/usePriceLists";
import { useSnackbar } from "../../context/SnackbarContext";
import "../../styles/css/pages/newPages.css";

const NewPriceListPage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-price-list";
  const { refreshPriceLists } = usePriceLists();
  const { showSnackbar } = useSnackbar();

  const handleSuccess = (msg: string) => {
    showSnackbar(msg, "success");
    navigate("/listas-precios");
  };

  return (
    <div className={`new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nueva Lista de Precios</h2>
      </div>
      <PriceListForm
        onCancel={() => navigate("/listas-precios")}
        isEditing={false}
        refreshPriceLists={async () => { await refreshPriceLists(); }}
        class={titlePage}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default NewPriceListPage;