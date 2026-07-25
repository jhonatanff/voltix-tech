import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminLoginPage from '../pages/admin/AdminLoginPage.jsx';
import ProductsPage from '../pages/admin/ProductsPage.jsx';
import SalesDashboardPage from '../pages/admin/SalesDashboardPage.jsx';
import ReportsPage from '../pages/admin/ReportsPage.jsx';
import TrashPage from '../pages/admin/TrashPage.jsx';
import CustomersPage from '../pages/admin/CustomersPage.jsx';
import '../admin/admin.css';

function RequireAdmin({ children }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminRoutes({ onProductsChanged }) {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<ProductsPage onProductsChanged={onProductsChanged} />} />
        <Route path="ventas" element={<SalesDashboardPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="papelera" element={<TrashPage onProductsChanged={onProductsChanged} />} />
        <Route path="usuarios" element={<CustomersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function AdminApp({ onProductsChanged }) {
  return (
    <AdminAuthProvider>
      <AdminRoutes onProductsChanged={onProductsChanged} />
    </AdminAuthProvider>
  );
}
