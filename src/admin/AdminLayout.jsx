import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

export default function AdminLayout() {
  const { logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">Voltix Admin</div>
        <nav className="admin-nav">
          <NavLink
            to="/admin/productos"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            id="admin-nav-productos"
          >
            📦 Productos
          </NavLink>
          <NavLink
            to="/admin/ventas"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            id="admin-nav-ventas"
          >
            📈 Ventas
          </NavLink>
          <NavLink
            to="/admin/reportes"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            id="admin-nav-reportes"
          >
            📋 Reportes
          </NavLink>
        </nav>
        <button className="admin-logout-btn" onClick={logout} id="admin-logout-btn">
          Cerrar sesión
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
