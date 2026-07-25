import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/AdminAuthContext.jsx';
import PasswordInput from '../../components/PasswordInput';
import AuthBackground from '../../components/AuthBackground';

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/productos" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/productos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section admin-login-section">
      <AuthBackground />
      <div className="container">
        <div className="auth-back-wrap">
          <Link to="/" className="back-link" id="admin-back-to-site">
            ← Volver al sitio
          </Link>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Panel de administración</h1>
          <p className="auth-subtitle">Acceso exclusivo para el administrador de Voltix Tech.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Correo electrónico</label>
              <input
                id="admin-email"
                className="form-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Contraseña</label>
              <PasswordInput
                id="admin-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary auth-submit-btn" type="submit" id="admin-login-submit-btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
