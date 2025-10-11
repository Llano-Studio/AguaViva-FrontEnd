import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import "../../styles/css/pages/passwordRecovery/passwordRecoveryPage.css";

const EmailConfirmationPage: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const authService = new AuthService();
  const navigate = useNavigate();
  const location = useLocation();

  // Efecto para la redirección después de un mensaje de éxito
  useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout>;
    if (isSuccess) {
      // Iniciar un temporizador para la cuenta regresiva visual
      let currentCountdown = 5;
      setCountdown(currentCountdown);
      const countdownInterval = setInterval(() => {
        currentCountdown -= 1;
        setCountdown(currentCountdown);
        if (currentCountdown === 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 5000);
    }
    return () => {
      clearTimeout(redirectTimer);
    };
  }, [isSuccess, navigate]);

  // Efecto para obtener el token de la URL y confirmar el email automáticamente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      confirmEmailWithToken(tokenFromUrl);
    } else {
      setError("Token de confirmación inválido o no proporcionado.");
      setIsLoading(false);
    }
  }, [location]);

  const confirmEmailWithToken = async (confirmationToken: string) => {
    setIsLoading(true);
    try {
      const response = await authService.confirmEmail(confirmationToken);
      if (response.success) {
        setMessage("¡Email confirmado exitosamente! Tu cuenta ha sido activada.");
        setIsSuccess(true);
      } else {
        setError(response.message || "Error al confirmar el email. El token puede haber expirado.");
      }
    } catch (err: any) {
      console.error("Error al confirmar email:", err);
      setError(err.message || "Error desconocido al confirmar el email.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const handleResendConfirmation = async () => {
    // Esta funcionalidad podría implementarse más adelante si es necesaria
    setError("Funcionalidad de reenvío no disponible. Contacta al administrador.");
  };

  return (
    <div className="recovery-container">
      <button 
        onClick={goToLogin} 
        className="back-button screen-top-left" 
        disabled={isLoading}
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="form-wrapper">
        <div className="w-full max-w-md px-8 wrap-form">
          <img src="/assets/imagenes/logo.svg" alt="Logo" className="logo" />
          <h1 className="title">Confirmación de Email</h1>
          
          <div className="mb-6 flex flex-col items-center">
            {isLoading && (
              <div className="loading-container">
                <p className="form-label">Confirmando tu email...</p>
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="error-container">
                <p className="error">{error}</p>
                <button 
                  onClick={handleResendConfirmation}
                  className="submit-button mt-4"
                  type="button"
                >
                  Solicitar nuevo enlace
                </button>
              </div>
            )}
            
            {isSuccess && message && (
              <div className="success-container">
                <div className="success-icon">
                  <svg 
                    className="w-16 h-16 text-green-500 mx-auto mb-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <p className="message">{message}</p>
                {countdown > 0 && (
                  <p className="redirect-message">
                    Redireccionando al login en {countdown} {countdown === 1 ? "segundo" : "segundos"}...
                  </p>
                )}
                <button 
                  onClick={goToLogin}
                  className="submit-button mt-4"
                  type="button"
                >
                  Ir al Login
                </button>
              </div>
            )}
          </div>
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

export default EmailConfirmationPage;