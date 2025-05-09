import React, { useState } from "react";
import { AuthService } from "../services/AuthService"; // Aquí sigue importando el servicio, pero no necesitamos pasar la URL

const PasswordRecoveryPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const authService = new AuthService(); // Ahora, no necesitamos pasar la URL manualmente

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Por favor ingresa un correo electrónico.");
      return;
    }

    try {
      const response = await authService.recoverPassword(email);

      if (response.success) {
        setMessage("Te hemos enviado un correo con el enlace para recuperar tu contraseña.");
      } else {
        setError("Hubo un problema al intentar recuperar tu contraseña.");
      }
    } catch (error) {
      console.error(error);
      setError("Error al intentar recuperar la contraseña.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Recuperar Contraseña</h1>
      <form onSubmit={handleRecovery} className="mb-6">
        <input
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Recuperar Contraseña
        </button>
      </form>
    </div>
  );
};

export default PasswordRecoveryPage;
