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
      <div>
      <div className="logo-container">
        <img src="/assets/imagenes/logo.svg" alt="Logo" className="w-32 h-auto logo" />
      </div>
      <aside className="sidebar">
        <nav>
          <ul>
            {modules.includes("zones") && (
              <li><NavLink to="/usuarios">
                <img src="/assets/icons/clientes.svg" alt="Usuarios" className="w-5 h-5" />
                Usuarios
                </NavLink></li>
            )}
            {modules.includes("persons") && (
              <li><NavLink to="/clientes">
                <img src="/assets/icons/clientes.svg" alt="Usuarios" className="w-5 h-5" />
                Clientes
                </NavLink></li>
            )}
            {modules.includes("articles") && (
              <li><NavLink to="/articulos">
                <img src="/assets/icons/articulos.svg" alt="Usuarios" className="w-5 h-5" />
                Artículos
                </NavLink></li>
            )}
            {modules.includes("mobiles") && (
              <li><NavLink to="/moviles">
                <img src="/assets/icons/entregas.svg" alt="Usuarios" className="w-5 h-5" />
                Móviles</NavLink></li>
            )}
            {modules.includes("zones") && (
              <li><NavLink to="/zonas">
                <img src="/assets/icons/zonas.svg" alt="Usuarios" className="w-5 h-5" />
                Zonas
                </NavLink></li>
            )}
            {modules.includes("deliveries") && (
              <li><NavLink to="/entregas">
                <img src="/assets/icons/entregas.svg" alt="Usuarios" className="w-5 h-5" />
                Entregas
                </NavLink></li>
            )}
          </ul>
        </nav>
      </aside>
      </div>

      <main className="content">
        <Outlet /> {/* Esto renderiza las rutas hijas */}
      </main>
    </div>
  );
};

export default DashboardLayout;
