import { useState, useEffect, useCallback } from 'react';
import { formatPrice, PAYMENT_METHODS, ORDER_STATUSES } from '../config';
import { useAuth } from '../auth/AuthContext';

export default function OrderHistoryPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customers/me/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No pudimos cargar tus pedidos.');
      setOrders(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const paymentLabel = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.label || id;
  const statusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label || id;

  return (
    <section className="product-detail-section">
      <div className="container">
        <h1 className="order-history-title">Mis Pedidos</h1>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <p className="catalog-status">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="catalog-status">Todavía no tienes pedidos.</p>
        ) : (
          <div className="order-history-list">
            {orders.map((order) => (
              <div className="order-history-card" key={order.id}>
                <div className="order-history-header">
                  <span>Pedido #{order.id}</span>
                  <span className={`order-status-badge order-status-${order.status}`}>{statusLabel(order.status)}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
                <ul className="order-history-items">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.productName} x{item.quantity} — {formatPrice(item.unitPrice * item.quantity)}
                    </li>
                  ))}
                </ul>
                <div className="order-history-footer">
                  <span>Pago: {paymentLabel(order.paymentMethod)}</span>
                  <span className="order-history-total">Total: {formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
