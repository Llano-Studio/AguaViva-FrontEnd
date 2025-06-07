import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PrivateRoute from "./PrivateRoute";

// Lazy loaded pages
const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));
const UsersPage = React.lazy(() => import("../pages/users/UsersPage"));
const ClientsPage = React.lazy(() => import("../pages/clients/ClientsPage"));
const NewClientPage = React.lazy(() => import("../pages/clients/NewClientPage"));
const ArticlesPage = React.lazy(() => import("../pages/articles/ArticlesPage"));
const MobilesPage = React.lazy(() => import("../pages/mobiles/MobilesPage"));
const DeliveriesPage = React.lazy(() => import("../pages/deliveries/DeliveriesPage"));
const NewUserPage = React.lazy(() => import("../pages/users/NewUserPage"));
const LoginPage = React.lazy(() => import("../pages/login/LoginPage"));
const PasswordRecovery = React.lazy(() => import("../pages/passwordRecovery/PasswordRecoveryPage"));
const ResetPasswordPage = React.lazy(() => import("../pages/resetPassword/ResetPasswordPage"));
const ZonesPage = React.lazy(() => import("../pages/zones/ZonesPage"));
const OrdersPage = React.lazy(() => import("../pages/orders/OrdersPage"));
const SuscriptionsPage = React.lazy(() => import("../pages/subscriptions/SubscriptionsPage"));
const PriceLists = React.lazy(() => import("../pages/priceLists/PriceLists"));
const ProfilePage = React.lazy(() => import("../pages/profile/ProfilePage"));


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
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="clientes/nuevo-cliente" element={<NewClientPage/>} />
            <Route path="entregas" element={<DeliveriesPage />} />
            <Route path="moviles" element={<MobilesPage />} />
            <Route path="zonas" element={<ZonesPage />} />
            <Route path="articulos" element={<ArticlesPage />} />
            <Route path="listas-precios" element={<PriceLists />} />
            <Route path="abonos" element={<SuscriptionsPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="usuarios/nuevo-usuario" element={<NewUserPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default AppRouter;