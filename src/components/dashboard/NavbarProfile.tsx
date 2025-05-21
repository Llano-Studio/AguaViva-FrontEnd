import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./NavbarProfile.css";


const NavbarProfile: React.FC = () => {

  const usuario = useAuth().user;
  console.log("usuario: ", usuario);

  return (
    <>
      <NavLink to="/zonas" className="navbar-profile">
        <img src="/assets/imagenes/profile-img.png" alt="Usuarios" className="navbar-img-profile" />
        <div className="navbar-datos-profile">
            <p className="navbar-name">{usuario?.name}</p>
            <p className="navbar-role">{usuario?.role}</p>
        </div>
      </NavLink>
    </>
  );
};

export default NavbarProfile;
