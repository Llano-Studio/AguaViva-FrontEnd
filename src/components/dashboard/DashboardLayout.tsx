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
                <li><NavLink to="/dashboard">
                  <img src="/assets/icons/inicio.svg" alt="Inicio" className="sidebar-li" />
                  Inicio
                  </NavLink></li>
              {modules.includes("orders") && (
                <li><NavLink to="/pedidos">
                  <img src="/assets/icons/pedidos.svg" alt="Pedidos" className="sidebar-li" />
                  Pedidos
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/clientes">
                  <img src="/assets/icons/clientes.svg" alt="Clientes" className="sidebar-li" />
                  Clientes
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/entregas">
                  <img src="/assets/icons/entregas.svg" alt="Entregas" className="sidebar-li" />
                  Entregas
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/moviles">
                  <img src="/assets/icons/mobiles.svg" alt="Mobiles" className="sidebar-li" />
                  Móviles</NavLink></li>
              )}
              {modules.includes("zones") && (
                <li><NavLink to="/zonas">
                  <img src="/assets/icons/zonas.svg" alt="Zonas" className="sidebar-li" />
                  Zonas
                  </NavLink></li>
              )}
              {modules.includes("inventory") && (
                <li><NavLink to="/articulos">
                  <img src="/assets/icons/articulos.svg" alt="Articulos" className="sidebar-li" />
                  Artículos
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/listas-precios">
                  <img src="/assets/icons/listasPrecios.svg" alt="Listas de precios" className="sidebar-li" />
                  Listas de precios
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/abonos">
                  <img src="/assets/icons/abonos.svg" alt="Abonos" className="sidebar-li" />
                  Abonos
                  </NavLink></li>
              )}
              {modules.includes("persons") && (
                <li><NavLink to="/usuarios">
                  <img src="/assets/icons/clientes.svg" alt="Usuarios" className="sidebar-li" />
                  Usuarios
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
      
        <main className="table-scroll content">
          <Outlet /> {/* Esto renderiza las rutas hijas */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
