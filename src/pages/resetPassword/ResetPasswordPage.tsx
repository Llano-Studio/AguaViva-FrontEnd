import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import "../../styles/css/pages/passwordRecovery/passwordRecoveryPage.css"; 

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmError, setConfirmError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Token inválido o no proporcionado.");
    }
  }, [location]);

  const validateField = (field: string, value: string) => {
    if (field === "password") {
      if (!value) setPasswordError("Por favor ingresa una contraseña");
      else if (value.length < 6) setPasswordError("La contraseña debe tener al menos 6 caracteres");
      else setPasswordError("");
    }
    if (field === "confirmPassword") {
      if (!value) setConfirmError("Por favor confirma tu contraseña");
      else if (password !== value) setConfirmError("Las contraseñas no coinciden");
      else setConfirmError("");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSuccess(false);

    // Validaciones explícitas antes de enviar
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    if (passwordError || confirmError || !password || !confirmPassword) {
        if(!password && !passwordError) setPasswordError("Por favor ingresa una contraseña");
        if(!confirmPassword && !confirmError) setConfirmError("Por favor confirma tu contraseña");
        return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, password);
      if (response.success) {
        setMessage("Contraseña actualizada correctamente");
        setIsSuccess(true);
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(response.message || "Ocurrió un error al restablecer la contraseña.");
      }
    } catch (err: any) {
      console.error("Error al restablecer contraseña:", err);
      setError(err.message || "Error desconocido al restablecer la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToLogin = () => {
    navigate("/login");
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <div className="recovery-container">
      <button onClick={goToLogin} className="back-button screen-top-left" disabled={isLoading || isSuccess}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="form-wrapper">
        <div className="w-full max-w-md px-8 wrap-form">
          <img src="/assets/imagenes/logo.svg" alt="Logo" className="logo" />
          <h1 className="title">Restablecer Contraseña</h1>
          
          <form onSubmit={handleResetPassword} className="mb-6 flex flex-col items-center">
            <p className="form-label">Nueva Contraseña</p>
            <div className="relative w-full mb-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validateField("password", e.target.value);
                }}
                className={`p-2 w-full ${passwordError ? 'input-error' : ''}`}
                disabled={isLoading || isSuccess}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={isLoading || isSuccess}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && <p className="field-error">{passwordError}</p>}
            
            <p className="form-label">Confirmar Contraseña</p>
            <div className="relative w-full mb-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateField("confirmPassword", e.target.value);
                }}
                className={`p-2 w-full ${confirmError ? 'input-error' : ''}`}
                disabled={isLoading || isSuccess}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-button"
                aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                disabled={isLoading || isSuccess}
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirmError && <p className="field-error">{confirmError}</p>}
            
            {error && !isSuccess && <p className="error">{error}</p>}
            
            {isSuccess && message && (
              <div className="success-container">
                <p className="message">{message}</p>
                {countdown > 0 && (
                  <p className="redirect-message">
                    Redireccionando al login en {countdown} {countdown === 1 ? "segundo" : "segundos"}...
                  </p>
                )}
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? "Procesando..." : "Actualizar Contraseña"}
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

export default ResetPasswordPage; 