import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading} // Desactivar el botón mientras se carga
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      <button onClick={goToPasswordRecovery} className="text-blue-500">
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
};

export default LoginPage;
