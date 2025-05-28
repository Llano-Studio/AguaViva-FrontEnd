import React from "react";
import UserForm from "../../components/users/UserForm";
import { useNavigate } from "react-router-dom";

const NewUserPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 mr-2"
        >
          <img src="/assets/icons/back.svg" alt="Volver" className="w-5 h-5 mr-1" />
          Cancelar
        </button>
        <h2 className="text-2xl font-bold ml-2">Nuevo Usuario</h2>
      </div>
      <UserForm
        onCancel={() => navigate("/usuarios")}
        isEditing={false}
        refreshUsers={async () => {}}
      />
    </div>
  );
};

export default NewUserPage;