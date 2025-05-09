import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useModulesByRole } from "../../hooks/useModulesByRole";
import "./DashboardLayout.css";

const DashboardLayout: React.FC = () => {
  const { modules, isLoadingModules } = useModulesByRole();

  if (isLoadingModules) {
    return <div>Cargando módulos...</div>; // O un loader más estilizado si prefieres
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav>
          <ul>
            {modules.includes("zones") && (
              <li><NavLink to="/usuarios">Usuarios</NavLink></li>
            )}
            {modules.includes("persons") && (
              <li><NavLink to="/clientes">Clientes</NavLink></li>
            )}
            {modules.includes("articles") && (
              <li><NavLink to="/articulos">Artículos</NavLink></li>
            )}
            {modules.includes("mobiles") && (
              <li><NavLink to="/moviles">Móviles</NavLink></li>
            )}
            {modules.includes("deliveries") && (
              <li><NavLink to="/entregas">Entregas</NavLink></li>
            )}
          </ul>
        </nav>
      </aside>

      <main className="content">
        <Outlet /> {/* Esto renderiza las rutas hijas */}
      </main>
    </div>
  );
};

export default DashboardLayout;
