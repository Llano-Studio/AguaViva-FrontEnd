import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { AuthService } from "../../services/AuthService";
import "../../styles/css/pages/profile/profilePage.css";
import "../../styles/css/components/common/itemForm.css";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const authService = new AuthService();
      const response = await authService.updatePassword(currentPassword, newPassword);
      setSuccess(response.message || "Contraseña cambiada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Izquierda: Foto y logout */}
        <div className="profile-page-header-container">
          <div className={`form-header profile-page-header`}>
                <button
                  onClick={() => navigate("/")}
                  className={`profile-page-header-close-button`}>
                  <img src="/assets/icons/back.svg" alt="Volver" className={`profile-page-header-icon-cancel"}`} />
                </button>
                <h2 className={`profile-page-header-title`}>Perfil</h2>
          </div>
        </div>
        <div className="profile-page-content-container">
          <div className="profile-left">
          <img
            src={user?.profileImageUrl || "/assets/profile-default.png"}
            alt="Foto de perfil"
            className="profile-photo"
          />
          <button
            onClick={logout}
            className="profile-logout-btn"
          >
            <img
              src="/assets/icons/sign-out.svg"
              alt="Cerrar sesión"
              className="profile-logout-icon"
            />
            Cerrar sesión
          </button>
        </div>

        {/* Derecha: Datos y cambio de contraseña */}
        <div className="profile-right">
          {/* Datos del usuario */}
          <section className="profile-section profile-section-information">
            <div>
              <h2>Información general</h2>
            </div>
            <div className="profile-information-fields">
              <div><strong>Nombre:</strong> <p>{user?.name || "-"}</p></div>
              <div><strong>Email:</strong> <p>{user?.email || "-"}</p></div>
              <div><strong>Rol:</strong> <p>{user?.role || "-"}</p></div>
            </div>
          </section>

          {/* Cambio de contraseña */}
          <section className="profile-section profile-section-password">
            <h2>Cambiar contraseña</h2>
            <div className="profile-fields">
              <label>
                Contraseña actual
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="profile-input"
                  disabled={loading}
                />
              </label>
              <label>
                Nueva contraseña
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="profile-input"
                  disabled={loading}
                />
              </label>
              <div className="profile-change-btn-container">
                {error && <div className="profile-error">{error}</div>}
                {success && <div className="profile-success">{success}</div>}
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !currentPassword || !newPassword}
                  className="form-submit profile-change-btn"
                >
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;