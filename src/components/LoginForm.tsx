import { useState } from "react";
import { LoginFormProps } from "../interfaces/LoginFormProps"; // Importamos la interfaz

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await onLogin(email, password);
    setLoading(false);

    if (!success) {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Correo"
        className="border p-2 rounded w-full mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="border p-2 rounded w-full mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Entrar"}
      </button>
    </form>
  );
};

export default LoginForm;
