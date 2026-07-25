import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fromCheckout = location.state?.from === 'checkout';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/', { state: fromCheckout ? { openCheckout: true } : undefined });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-title">Inicia sesión</h1>
          <p className="auth-subtitle">
            {fromCheckout
              ? 'Inicia sesión para completar tu pedido por WhatsApp.'
              : 'Ingresa con tu cuenta de Voltix Tech.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary auth-submit-btn" type="submit" id="login-submit-btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-switch">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" state={location.state} id="go-to-register-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
