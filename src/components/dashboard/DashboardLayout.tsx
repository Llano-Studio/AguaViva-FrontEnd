import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useModulesByRole } from "../../hooks/useModulesByRole";
import "../../styles/css/components/dashboard/dashboardLayout.css";
import NavbarProfile from "./NavbarProfile";


const DashboardLayout: React.FC = () => {
  const { modules, isLoadingModules } = useModulesByRole();

  if (isLoadingModules) {
    return <div>Cargando módulos...</div>; // O un loader más estilizado si prefieres
  }

  return (
    <div className="dashboard-layout">
      <div>
        <div className="logo-container">
          <img src="/assets/imagenes/logo.svg" alt="Logo" className="logo" />
        </div>
        <aside className="sidebar">
          <nav>
            <ul>
              {modules.includes("zones") && (
                <li><NavLink to="/usuarios">
                  <img src="/assets/icons/clientes.svg" alt="Usuarios" className="sidebar-li" />
                  Usuarios
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/clientes">
                  <img src="/assets/icons/clientes.svg" alt="Usuarios" className="sidebar-li" />
                  Clientes
                  </NavLink></li>
              )}
              {modules.includes("articles") && (
                <li><NavLink to="/articulos">
                  <img src="/assets/icons/articulos.svg" alt="Usuarios" className="sidebar-li" />
                  Artículos
                  </NavLink></li>
              )}
              {modules.includes("mobiles") && (
                <li><NavLink to="/moviles">
                  <img src="/assets/icons/entregas.svg" alt="Usuarios" className="sidebar-li" />
                  Móviles</NavLink></li>
              )}
              {modules.includes("zones") && (
                <li><NavLink to="/zonas">
                  <img src="/assets/icons/zonas.svg" alt="Usuarios" className="sidebar-li" />
                  Zonas
                  </NavLink></li>
              )}
              {modules.includes("deliveries") && (
                <li><NavLink to="/entregas">
                  <img src="/assets/icons/entregas.svg" alt="Usuarios" className="sidebar-li" />
                  Entregas
                  </NavLink></li>
              )}
            </ul>
          </nav>
        </aside>
      </div>

      <div className="main-container">
        <div className="navbar-container">
              <h1></h1>
              <NavbarProfile/>
        </div>        
      

        <main className="content">
          <Outlet /> {/* Esto renderiza las rutas hijas */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
