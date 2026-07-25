import { useState, useEffect, useCallback } from 'react';
import { adminFetch, adminFetchJSON } from '../../admin/api.js';
import CustomerFormModal from './CustomerFormModal.jsx';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin/customers');
      if (!res.ok) throw new Error('No se pudo cargar la lista de usuarios.');
      setCustomers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = () => {
    setEditingCustomer(null);
    setShowCreateForm(false);
    load();
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`¿Eliminar la cuenta de "${customer.name}"? Ya no podrá iniciar sesión.`)) return;
    try {
      await adminFetchJSON(`/api/admin/customers/${customer.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-wide-page">
      <div className="admin-page-header">
        <h1>Usuarios</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateForm(true)} id="new-customer-btn">
          + Nuevo usuario
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p className="catalog-status">Cargando...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString('es-CO')}</td>
                  <td className="admin-table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingCustomer(c)} id={`edit-customer-${c.id}`}>
                      Editar
                    </button>
                    <button className="admin-delete-btn" onClick={() => handleDelete(c)} id={`delete-customer-${c.id}`}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p className="catalog-status">Todavía no hay usuarios registrados.</p>}
        </div>
      )}

      {(showCreateForm || editingCustomer) && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => { setEditingCustomer(null); setShowCreateForm(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
