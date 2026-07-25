import { useState } from 'react';
import PasswordInput from '../../components/PasswordInput';
import { adminFetchJSON } from '../../admin/api.js';

export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const isEditing = Boolean(customer);
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Nombre, teléfono y correo son obligatorios.');
      return;
    }
    if (!isEditing && !password) {
      setError('La contraseña es obligatoria para crear el usuario.');
      return;
    }
    if (password && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const payload = { name: name.trim(), phone: phone.trim(), email: email.trim() };
    if (password) payload.password = password;

    setSaving(true);
    try {
      if (isEditing) {
        await adminFetchJSON(`/api/admin/customers/${customer.id}`, { method: 'PUT', body: payload });
      } else {
        await adminFetchJSON('/api/admin/customers', { method: 'POST', body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="customer-form-modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <button className="cart-close-btn" onClick={onClose} id="customer-form-close-btn" type="button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="cf-name">Nombre completo</label>
              <input id="cf-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cf-phone">Teléfono</label>
              <input id="cf-phone" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cf-email">Correo electrónico</label>
              <input id="cf-email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cf-password">
                {isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              </label>
              <PasswordInput
                id="cf-password"
                placeholder={isEditing ? 'Dejar en blanco para no cambiarla' : 'Mínimo 6 caracteres'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary" type="submit" id="customer-form-save-btn" disabled={saving}>
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
