import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import SpinnerLoading from "../components/common/SpinnerLoading"; // <-- agregar


// Lazy loaded pages
const DashboardPage = React.lazy(() => import("../pages/dashboard/DashboardPage"));
const UsersPage = React.lazy(() => import("../pages/users/UsersPage"));
const ClientsPage = React.lazy(() => import("../pages/clients/ClientsPage"));
const NewClientPage = React.lazy(() => import("../pages/clients/NewClientPage"));
const ProductsPage = React.lazy(() => import("../pages/products/ProductsPage"));
const NewProductPage = React.lazy(() => import("../pages/products/NewProductPage"));
const VehiclesPage = React.lazy(() => import("../pages/vehicles/VehiclesPage"));
const NewVehiclePage = React.lazy(() => import("../pages/vehicles/NewVehiclePage"));
const DeliveriesPage = React.lazy(() => import("../pages/deliveries/DeliveriesPage"));
const NewUserPage = React.lazy(() => import("../pages/users/NewUserPage"));
const LoginPage = React.lazy(() => import("../pages/login/LoginPage"));
const PasswordRecovery = React.lazy(() => import("../pages/passwordRecovery/PasswordRecoveryPage"));
const ResetPasswordPage = React.lazy(() => import("../pages/resetPassword/ResetPasswordPage"));
const EmailConfirmationPage = React.lazy(() => import("../pages/emailConfirmation/EmailConfirmationPage"));
const ZonesPage = React.lazy(() => import("../pages/zones/ZonesPage"));
const NewZonePage = React.lazy(() => import("../pages/zones/NewZonePage"));
const OrdersPage = React.lazy(() => import("../pages/orders/OrdersPage"));
const NewOrderPage = React.lazy(() => import("../pages/orders/NewOrderPage"));
const SubscriptionPlansPage = React.lazy(() => import("../pages/subscriptionPlans/SubscriptionPlansPage"));
const NewSubscriptionPlanPage = React.lazy(() => import("../pages/subscriptionPlans/NewSubscriptionPlanPage"));
const PriceLists = React.lazy(() => import("../pages/priceLists/PriceListsPage"));
const NewPriceListPage = React.lazy(() => import("../pages/priceLists/NewPriceListPage"));
const ProfilePage = React.lazy(() => import("../pages/profile/ProfilePage"));
const NewRouteSheet = React.lazy(() => import("../pages/routeSheets/NewRouteSheetPage"));


const AppRouter: React.FC = () => {
  return (
    <Router>
      <React.Suspense 
        fallback={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 10 }}>
            <SpinnerLoading size={60} />
          </div>
        }
      >
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-clave" element={<PasswordRecovery />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/confirmar-email" element={<EmailConfirmationPage />} />

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
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pedidos/nuevo-pedido" element={<NewOrderPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="clientes/nuevo-cliente" element={<NewClientPage/>} />
            <Route path="entregas" element={<DeliveriesPage />} />
            <Route path="hojas-de-ruta/nueva-hoja-de-ruta" element={<NewRouteSheet />} />
            <Route path="moviles" element={<VehiclesPage />} />
            <Route path="moviles/nuevo-movil" element={<NewVehiclePage />} />
            <Route path="zonas" element={<ZonesPage />} />
            <Route path="zonas/nueva-zona" element={<NewZonePage />} />
            <Route path="articulos" element={<ProductsPage />} />
            <Route path="articulos/nuevo-articulo" element={<NewProductPage />} />
            <Route path="listas-precios" element={<PriceLists />} />
            <Route path="listas-precios/nueva-lista-precios" element={<NewPriceListPage />} />
            <Route path="abonos" element={<SubscriptionPlansPage />} />
            <Route path="abonos/nuevo-abono" element={<NewSubscriptionPlanPage />} />
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