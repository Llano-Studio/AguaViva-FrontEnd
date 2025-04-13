import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import PasswordRecovery from "../pages/PasswordRecovery";
import PrivateRoute from "./PrivateRoute";
import {UsersPage} from "../pages/UsersPage";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />

      {/* Rutas protegidas */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />

      {/* Ruta adicional (puede eliminarse si no la usás) */}
      <Route path="/dashboard2" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
