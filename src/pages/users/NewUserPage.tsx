import React from "react";
import UserForm from "../../components/users/UserForm";
import { useNavigate } from "react-router-dom";
import useUsers from "../../hooks/useUsers";
import "../../styles/css/pages/newPages.css";

const NewUserPage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-user";
  const { createUser, refreshUsers } = useUsers();

  // El UserForm ya soporta imagen y FormData, solo pasamos las props necesarias
  return (
    <div className={`new-page-container ${titlePage+"-page-container"}`}>
      <div className={`new-page-header ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`new-page-button-cancel ${titlePage+"-page-button-cancel"}`}>
          <img src="/assets/icons/back.svg" alt="Volver" className={`new-page-icon-cancel ${titlePage+"-page-icon-cancel"}`} />
        </button>
        <h2 className={`new-page-title ${titlePage+"-page-title"}`}>Nuevo Usuario</h2>
      </div>
      <UserForm
        onCancel={() => navigate("/usuarios")}
        isEditing={false}
        refreshUsers={refreshUsers}
        class={titlePage}
      />
    </div>
  );
};

export default NewUserPage;