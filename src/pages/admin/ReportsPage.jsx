import { useState, useEffect, useCallback } from 'react';
import { formatPrice, PAYMENT_METHODS, ORDER_STATUSES } from '../../config';
import { adminFetch, adminFetchJSON } from '../../admin/api.js';
import { toCSV, downloadCSV } from '../../admin/csv.js';

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function OrderNoteModal({ order, onClose, onSaved }) {
  const [note, setNote] = useState(order.adminNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await adminFetchJSON(`/api/orders/${order.id}/note`, { method: 'PATCH', body: { note } });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="order-note-modal">
        <div className="modal-header">
          <h2>Nota del pedido #{order.id}</h2>
          <button className="cart-close-btn" onClick={onClose} id="order-note-close-btn" type="button">×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="order-note-textarea">
              Nota interna (el cliente la ve en su historial de pedidos)
            </label>
            <textarea
              id="order-note-textarea"
              className="form-input admin-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Pago confirmado, en camino con Envía, guía #123..."
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="order-note-save-btn" type="button">
            {saving ? 'Guardando...' : 'Guardar nota'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [from, setFrom] = useState(toDateInputValue(thirtyDaysAgo));
  const [to, setTo] = useState(toDateInputValue(today));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteOrder, setNoteOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', `${from}T00:00:00.000Z`);
      if (to) params.set('to', `${to}T23:59:59.999Z`);
      const res = await adminFetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudieron cargar los pedidos.');
      setOrders(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const paymentLabel = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.label || id;
  const statusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label || id;

  const handleExport = () => {
    const csv = toCSV(orders, [
      { label: 'Pedido #', value: (o) => o.id },
      { label: 'Fecha', value: (o) => new Date(o.createdAt).toLocaleString('es-CO') },
      { label: 'Cliente', value: (o) => o.customerName },
      { label: 'Teléfono', value: (o) => o.customerPhone },
      { label: 'Correo', value: (o) => o.customerEmail || '' },
      { label: 'Productos', value: (o) => o.items.map((i) => `${i.productName} x${i.quantity}`).join('; ') },
      { label: 'Subtotal', value: (o) => o.subtotal },
      { label: 'Envío', value: (o) => o.shippingCost },
      { label: 'Total', value: (o) => o.total },
      { label: 'Método de pago', value: (o) => paymentLabel(o.paymentMethod) },
      { label: 'Estado', value: (o) => statusLabel(o.status) },
      { label: 'Nota', value: (o) => o.adminNote || '' },
      { label: 'Dirección', value: (o) => o.shippingAddress },
    ]);
    downloadCSV(`pedidos_${from}_a_${to}.csv`, csv);
  };

  const handleStatusChange = async (orderId, status) => {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await adminFetchJSON(`/api/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
    } catch (err) {
      setOrders(previous);
      alert(err.message);
    }
  };

  return (
    <div className="admin-wide-page">
      <div className="admin-page-header">
        <h1>Órdenes</h1>
        <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={orders.length === 0} id="export-csv-btn">
          Exportar CSV
        </button>
      </div>

      <div className="admin-filters">
        <div className="form-group">
          <label className="form-label" htmlFor="report-from">Desde</label>
          <input id="report-from" type="date" className="form-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="report-to">Hasta</label>
          <input id="report-to" type="date" className="form-input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p className="catalog-status">Cargando...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString('es-CO')}</td>
                  <td>{o.customerName}</td>
                  <td>{o.customerEmail || '—'}</td>
                  <td>{o.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>{paymentLabel(o.paymentMethod)}</td>
                  <td>
                    <select
                      className={`order-status-select order-status-${o.status}`}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      id={`order-status-${o.id}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setNoteOrder(o)}
                      id={`order-note-btn-${o.id}`}
                      type="button"
                    >
                      {o.adminNote ? 'Ver nota' : '+ Nota'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="catalog-status">No hay pedidos en este rango de fechas.</p>}
        </div>
      )}

      {noteOrder && (
        <OrderNoteModal
          order={noteOrder}
          onClose={() => setNoteOrder(null)}
          onSaved={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, adminNote: updated.adminNote } : o)));
            setNoteOrder(null);
          }}
        />
      )}
    </div>
  );
}
