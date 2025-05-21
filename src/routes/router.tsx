import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import LoginPage from "../pages/LoginPage";
import PasswordRecovery from "../pages/PasswordRecoveryPage";
import PrivateRoute from "./PrivateRoute";
import ZonesPage from "../pages/ZonesPage";

// Lazy loaded pages
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const UsersPage = React.lazy(() => import("../pages/UsersPage"));
const ClientsPage = React.lazy(() => import("../pages/ClientsPage"));
const ArticlesPage = React.lazy(() => import("../pages/ArticlesPage"));
const MobilesPage = React.lazy(() => import("../pages/MobilesPage"));
const DeliveriesPage = React.lazy(() => import("../pages/DeliveriesPage"));

const AppRouter: React.FC = () => {
  return (
    <Router>
      <React.Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-clave" element={<PasswordRecovery />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />

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