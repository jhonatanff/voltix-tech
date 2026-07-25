import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext.jsx';

const STORAGE_KEY = 'voltix_admin_sidebar_collapsed';

const NAV_ITEMS = [
  { to: '/admin/productos', icon: '📦', label: 'Productos', id: 'admin-nav-productos' },
  { to: '/admin/ventas', icon: '📈', label: 'Ventas', id: 'admin-nav-ventas' },
  { to: '/admin/reportes', icon: '📋', label: 'Reportes', id: 'admin-nav-reportes' },
  { to: '/admin/papelera', icon: '🗑️', label: 'Papelera', id: 'admin-nav-papelera' },
  { to: '/admin/usuarios', icon: '👤', label: 'Usuarios', id: 'admin-nav-usuarios' },
];

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-icon">⚡</span>
            <span className="admin-nav-label">Voltix Admin</span>
          </div>
          <button
            className="admin-sidebar-toggle"
            onClick={toggleCollapsed}
            id="admin-sidebar-toggle"
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              id={item.id}
              title={item.label}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="admin-logout-btn" onClick={logout} id="admin-logout-btn" title="Cerrar sesión">
          <span className="admin-nav-icon">🚪</span>
          <span className="admin-nav-label">Cerrar sesión</span>
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
