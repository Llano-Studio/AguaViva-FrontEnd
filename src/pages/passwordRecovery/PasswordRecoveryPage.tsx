import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService, PasswordRecoveryResponse } from "../../services/AuthService";
import "../../styles/css/pages/passwordRecovery/passwordRecoveryPage.css";

const PasswordRecoveryPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const authService = new AuthService();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (message) {
      timer = setTimeout(() => {
        setMessage("");
        setEmail(""); 
      }, 10000); 
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message]);

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setMessage(""); 

    if (!email) {
      setError("Por favor ingresa un correo electrónico.");
      return;
    }

    try {
      const response: PasswordRecoveryResponse = await authService.recoverPassword(email);

      if (response.success) {
        setMessage(response.message || "Se ha enviado un correo con las instrucciones para recuperar la contraseña");
      } else {
        setError(response.message || "Hubo un problema al intentar recuperar tu contraseña.");
      }
    } catch (error: any) {
      console.error("Error en componente:", error);
      if (error.message === "Failed to fetch") {
        setError("No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.");
      } else {
        setError(error.message || "Error al intentar recuperar la contraseña.");
      }
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="recovery-container">
      <button onClick={goToLogin} className="back-button screen-top-left">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="form-wrapper">
        <div className="w-full max-w-md px-8 wrap-form">
          <img src="/assets/imagenes/logo.svg" alt="Logo" className="logo" />
          <h1 className="title">Recuperar Contraseña</h1>
          <form onSubmit={handleRecovery} className="mb-6 flex flex-col items-center">
            <p className="form-label">Email</p>
            <input
              type="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-2 p-2"
            />
            {error && <p className="error">{error}</p>}
            {message && <p className="message">{message}</p>}
            <button type="submit" className="submit-button">
              Enviar Correo
            </button>
          </form>
        </div>
      </div>
      <div className="background-image-wrapper">
        <img
          src="/assets/imagenes/login-img.svg" 
          alt="Fondo"
          className="background-image"
        />
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;
