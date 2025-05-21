import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Resetear errores previos
    setLoading(true); // Activar estado de carga

    const success = await login(email, password);

    setLoading(false); // Desactivar estado de carga

    if (success) {
      navigate("/dashboard"); // Redirige al Dashboard después del login
    } else {
      setError("Credenciales inválidas");
    }
  };

  const goToPasswordRecovery = () => {
    navigate("/password-recovery");
  };

  // Iconos SVG para mostrar/ocultar contraseña
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
    <>
      <div className="login-container flex min-h-screen relative">
      
        <div className="absolute left-0 top-0 h-full w-[50%] bg-transparent flex items-center justify-center z-10">
          <div className="w-full max-w-md px-8 bg-white wrap-form">
            <img src="/assets/imagenes/logo.svg" alt="Logo" className="w-32 h-auto logo" />
            <form onSubmit={handleSubmit} className="mb-6 flex flex-col">
              <p>Email</p>
              <input
                type="email"
                placeholder="Ejemplo@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded"
              />
              <p>Contraseña</p>
              <div className="relative w-full mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Escribí tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-button absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button onClick={goToPasswordRecovery} className="text-blue-500 recovery-password">
              ¿Olvidaste tu contraseña?
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 submit"
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            
          </div>
        </div>

        {/* Imagen fondo izquierda (70%) */}
        <div className="absolute right-0 w-[70%] wrap-fondo">
          <img
            src="/assets/imagenes/login-img.svg"
            alt="Fondo"
            className="w-full h-full object-cover fondo"
          />
        </div>
    </div>

    </>
  );
};

export default LoginPage;
