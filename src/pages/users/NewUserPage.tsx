import React from "react";
import UserForm from "../../components/users/UserForm";
import { useNavigate } from "react-router-dom";

const NewUserPage: React.FC = () => {
  const navigate = useNavigate();
  const titlePage = "new-user";

  return (
    <div className={`p-4 max-w-xl mx-auto ${titlePage+"-page-container"}`}>
      <div className={`flex items-center mb-4 ${titlePage+"-page-header"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center text-gray-600 hover:text-blue-600 mr-2 ${titlePage+"-page-button-cancel"}`}
        >
          <img src="/assets/icons/back.svg" alt="Volver" className={`w-5 h-5 mr-1 ${titlePage+"-page-icon-cancel"}`} />
          Cancelar
        </button>
        <h2 className={`text-2xl font-bold ml-2 ${titlePage+"-page-title"}`}>Nuevo Usuario</h2>
      </div>
      <UserForm
        onCancel={() => navigate("/usuarios")}
        isEditing={false}
        refreshUsers={async () => {}}
        class={titlePage}
      />
    </div>
  );
};

export default NewUserPage;