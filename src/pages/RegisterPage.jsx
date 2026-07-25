import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fromCheckout = location.state?.from === 'checkout';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, phone, email, password });
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
          <h1 className="auth-title">Crea tu cuenta</h1>
          <p className="auth-subtitle">
            {fromCheckout
              ? 'Regístrate para completar tu pedido por WhatsApp.'
              : 'Únete a Voltix Tech para hacer seguimiento a tus pedidos.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Nombre completo</label>
              <input
                id="register-name"
                className="form-input"
                type="text"
                placeholder="Tu nombre"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">Teléfono / WhatsApp</label>
              <input
                id="register-phone"
                className="form-input"
                type="tel"
                placeholder="300 123 4567"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Correo electrónico</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Contraseña</label>
              <input
                id="register-password"
                className="form-input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">Confirmar contraseña</label>
              <input
                id="register-confirm-password"
                className="form-input"
                type="password"
                placeholder="Repite tu contraseña"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary auth-submit-btn" type="submit" id="register-submit-btn" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" state={location.state} id="go-to-login-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
