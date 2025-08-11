import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/css/components/dashboard/navbarProfile.css";
import ImageProfile from "../common/ImageProfile";
import { renderRoleLabel } from "../../utils/roleLabels";

const NavbarProfile: React.FC = () => {
  const usuario = useAuth().user;
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <NavLink to="/perfil" className="navbar-profile">
        <ImageProfile src={usuario?.profileImageUrl} alt="Usuarios" className="navbar-img-profile" />
        <div className="navbar-datos-profile" ref={dropdownRef} style={{ position: "relative" }}>
          <div className="navbar-datos-profile-container-1">
            <p className="navbar-name">{usuario?.name}</p>
            <p className="navbar-role">{renderRoleLabel ? renderRoleLabel(usuario?.role ?? "") : usuario?.role}</p>
          </div>
          <div className="navbar-datos-profile-container-2">
            <button
              className="navbar-profile-dropdown-btn"
              onClick={e => {
                e.preventDefault();
                setOpen((prev) => !prev);
              }}
              aria-label="Mostrar opciones"
              type="button"
            >
              <img src="/assets/icons/arrow-down-white.svg" alt="Volver" className="navbar-profile-dropdown-icon" />
            </button>
          </div>
          <div className={`navbar-profile-dropdown${open ? " show" : ""}`}>
            <button
              className="navbar-profile-logout-btn"
              onClick={e => {
                e.preventDefault();
                logout();
              }}
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </NavLink>
    </>
  );
};

export default NavbarProfile;