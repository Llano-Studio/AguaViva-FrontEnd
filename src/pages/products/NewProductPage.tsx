import React from "react";
import {ProductForm} from "../../components/products/ProductForm";
import { useNavigate } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import "../../styles/css/pages/newPages.css";

const NewProductPage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-product";
  const { createProduct, refreshProducts } = useProducts();

  return (
    <div className={`new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nuevo Artículo</h2>
      </div>
      <ProductForm
        onCancel={() => navigate("/articulos")}
        isEditing={false}
        refreshProducts={refreshProducts}
        class={titlePage}
      />
    </div>
  );
};

export default NewProductPage;