import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatPrice } from '../../config';
import { adminFetch } from '../../admin/api.js';

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function compactNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ---- Gráfico de barras genérico, un solo color (la magnitud, no la identidad, es el dato) ----
function BarChart({ bars, height = 220, formatValue = (v) => v, valueForLabel = (v) => v }) {
  const width = 720;
  const paddingLeft = 44;
  const paddingBottom = 28;
  const paddingTop = 16;
  const chartWidth = width - paddingLeft - 8;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(1, ...bars.map((b) => b.value));
  const barSlot = chartWidth / bars.length;
  const barWidth = Math.min(24, barSlot * 0.6);

  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = (maxValue / yTicks) * i;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return { value, y };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg" role="img">
      {gridLines.map((g) => (
        <g key={g.value}>
          <line
            x1={paddingLeft}
            x2={width - 8}
            y1={g.y}
            y2={g.y}
            className="admin-chart-gridline"
          />
          <text x={paddingLeft - 8} y={g.y + 4} className="admin-chart-axis-label" textAnchor="end">
            {compactNumber(Math.round(g.value))}
          </text>
        </g>
      ))}

      {bars.map((bar, i) => {
        const barHeight = maxValue > 0 ? (bar.value / maxValue) * chartHeight : 0;
        const x = paddingLeft + i * barSlot + (barSlot - barWidth) / 2;
        const y = paddingTop + chartHeight - barHeight;
        return (
          <g key={bar.label} className="admin-chart-bar-group">
            <title>{`${bar.label}: ${formatValue(valueForLabel(bar.value))}`}</title>
            <rect
              x={x}
              y={barHeight > 0 ? y : y - 1}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={4}
              className="admin-chart-bar"
            />
            <text x={x + barWidth / 2} y={paddingTop + chartHeight + 18} className="admin-chart-axis-label" textAnchor="middle">
              {bar.shortLabel || bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SalesDashboardPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [from] = useState(toDateInputValue(thirtyDaysAgo));
  const [to] = useState(toDateInputValue(today));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` });
      const res = await adminFetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudieron cargar las ventas.');
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

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
    return { totalRevenue, orderCount, avgTicket };
  }, [orders]);

  const revenueByDay = useMemo(() => {
    const days = [];
    const cursor = new Date(`${from}T00:00:00.000Z`);
    const end = new Date(`${to}T00:00:00.000Z`);
    while (cursor <= end) {
      days.push(toDateInputValue(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const totals = new Map(days.map((d) => [d, 0]));
    for (const order of orders) {
      const day = order.createdAt.slice(0, 10);
      if (totals.has(day)) totals.set(day, totals.get(day) + order.total);
    }
    return days.map((d) => ({
      label: new Date(`${d}T00:00:00.000Z`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      shortLabel: d.slice(8, 10),
      value: totals.get(d),
    }));
  }, [orders, from, to]);

  const topProducts = useMemo(() => {
    const totals = new Map();
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productName;
        totals.set(key, (totals.get(key) || 0) + item.unitPrice * item.quantity);
      }
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({
        label,
        shortLabel: label.length > 12 ? `${label.slice(0, 11)}…` : label,
        value,
      }));
  }, [orders]);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Ventas</h1>
        <span className="admin-page-subtitle">Últimos 30 días</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p className="catalog-status">Cargando...</p>
      ) : (
        <>
          <div className="admin-stat-tiles">
            <div className="admin-stat-tile">
              <span className="admin-stat-label">Ventas totales</span>
              <span className="admin-stat-value">{formatPrice(stats.totalRevenue)}</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-label">Pedidos</span>
              <span className="admin-stat-value">{stats.orderCount}</span>
            </div>
            <div className="admin-stat-tile">
              <span className="admin-stat-label">Ticket promedio</span>
              <span className="admin-stat-value">{formatPrice(Math.round(stats.avgTicket))}</span>
            </div>
          </div>

          <div className="admin-charts-grid">
            <div className="admin-chart-card">
              <h2>Ventas por día</h2>
              {revenueByDay.some((d) => d.value > 0) ? (
                <BarChart bars={revenueByDay} formatValue={formatPrice} />
              ) : (
                <p className="catalog-status">Sin ventas en este período.</p>
              )}
            </div>

            <div className="admin-chart-card">
              <h2>Productos más vendidos</h2>
              {topProducts.length > 0 ? (
                <BarChart bars={topProducts} formatValue={formatPrice} />
              ) : (
                <p className="catalog-status">Sin ventas en este período.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
