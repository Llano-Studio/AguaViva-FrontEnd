import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import PasswordRecovery from "../pages/PasswordRecovery";
import PrivateRoute from "./PrivateRoute";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />
      {/* Rutas protegidas */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      {/* Ruta adicional */}
      <Route path="/dashboard2" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
