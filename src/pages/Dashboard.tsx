import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirige al login después de cerrar sesión
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Bienvenido al Dashboard</h1>
      <p className="text-lg mb-6">¡Hola, {user?.name}!</p> {/* Muestra el nombre del usuario */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;
