import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import LoginPage from "../pages/login/LoginPage";
import PasswordRecovery from "../pages/passwordRecovery/PasswordRecoveryPage";
import ResetPasswordPage from "../pages/resetPassword/ResetPasswordPage";
import PrivateRoute from "./PrivateRoute";
import ZonesPage from "../pages/zones/ZonesPage";

// Lazy loaded pages
const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));
const UsersPage = React.lazy(() => import("../pages/users/UsersPage"));
const ClientsPage = React.lazy(() => import("../pages/clients/ClientsPage"));
const ArticlesPage = React.lazy(() => import("../pages/articles/ArticlesPage"));
const MobilesPage = React.lazy(() => import("../pages/mobiles/MobilesPage"));
const DeliveriesPage = React.lazy(() => import("../pages/deliveries/DeliveriesPage"));
const NewUserPage = React.lazy(() => import("../pages/users/NewUserPage"));

const AppRouter: React.FC = () => {
  return (
    <Router>
      <React.Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-clave" element={<PasswordRecovery />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas privadas con layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="usuarios/nuevo-usuario" element={<NewUserPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="articulos" element={<ArticlesPage />} />
            <Route path="moviles" element={<MobilesPage />} />
            <Route path="entregas" element={<DeliveriesPage />} />
            <Route path="zonas" element={<ZonesPage />} />
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default AppRouter;