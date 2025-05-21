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
              <input
                type="password"
                placeholder="Escribí tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-2 p-2 border border-gray-300 rounded"
              />
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
