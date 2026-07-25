import { Router } from 'express';
import { pool, withTransaction } from '../lib/db.js';
import { requireAdmin } from '../lib/adminAuth.js';
import { attachCustomerIfPresent } from '../lib/customerAuth.js';
import { notifyNewOrder } from '../lib/notify.js';
import { toOrder, fetchOrdersWithItems } from '../lib/orderSerializer.js';
import { SHIPPING_COSTS, PAYMENT_METHOD_IDS, ORDER_STATUS_IDS } from '../../shared/constants.js';

const router = Router();

class InsufficientStockError extends Error {
  constructor(productId) {
    super('insufficient_stock');
    this.productId = productId;
  }
}

// POST /api/orders — pública. Crea el pedido, descuenta stock de forma atómica.
// Si viene un Bearer de cliente válido, el pedido queda vinculado a su cuenta;
// si no (invitado), sigue funcionando exactamente igual que antes.
router.post('/', attachCustomerIfPresent, async (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) return res.status(400).json({ error: 'El carrito está vacío.' });
  if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios.' });
  }
  if (!body.customerEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail.trim())) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }
  if (!body.shippingAddress?.trim()) {
    return res.status(400).json({ error: 'La dirección de envío es obligatoria.' });
  }
  if (!['local', 'national'].includes(body.shippingType)) {
    return res.status(400).json({ error: 'Tipo de envío inválido.' });
  }
  if (!PAYMENT_METHOD_IDS.includes(body.paymentMethod)) {
    return res.status(400).json({ error: 'Método de pago inválido.' });
  }

  // Orden determinístico por productId: evita deadlocks si dos pedidos
  // concurrentes tocan los mismos productos en orden distinto.
  const sortedItems = [...items].sort((a, b) => String(a.productId).localeCompare(String(b.productId)));

  try {
    const order = await withTransaction(async (client) => {
      const lines = [];
      for (const { productId, quantity } of sortedItems) {
        const qty = Number(quantity);
        if (!productId || !Number.isInteger(qty) || qty <= 0) {
          throw new Error('invalid_item');
        }
        const { rows } = await client.query(
          `UPDATE products SET stock = stock - $1, updated_at = now()
           WHERE id = $2 AND stock >= $1 AND deleted_at IS NULL
           RETURNING id, name, price`,
          [qty, productId]
        );
        if (rows.length === 0) throw new InsufficientStockError(productId);
        lines.push({ ...rows[0], quantity: qty });
      }

      const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
      const shippingCost = body.shippingType === 'local' ? SHIPPING_COSTS.local : SHIPPING_COSTS.national;
      const total = subtotal + shippingCost;

      const orderResult = await client.query(
        `INSERT INTO orders
          (customer_name, customer_phone, customer_email, shipping_type, shipping_city, shipping_carrier, shipping_address, payment_method, notes, subtotal, shipping_cost, total, customer_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          body.customerName.trim(),
          body.customerPhone.trim(),
          body.customerEmail.trim().toLowerCase(),
          body.shippingType,
          body.shippingCity || null,
          body.shippingCarrier || null,
          body.shippingAddress.trim(),
          body.paymentMethod,
          body.notes || null,
          subtotal,
          shippingCost,
          total,
          req.customerId || null,
        ]
      );
      const orderRow = orderResult.rows[0];

      const itemRows = [];
      for (const line of lines) {
        const { rows } = await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
           VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [orderRow.id, line.id, line.name, line.price, line.quantity]
        );
        itemRows.push(rows[0]);
      }

      return toOrder(orderRow, itemRows);
    });

    // Se espera antes de responder: en un runtime serverless, la ejecución
    // puede congelarse justo después de enviar la respuesta, así que un
    // "fire and forget" real no garantizaría que el correo salga.
    await notifyNewOrder(order);
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return res.status(409).json({ error: 'insufficient_stock', productId: err.productId });
    }
    if (err.message === 'invalid_item') {
      return res.status(400).json({ error: 'Uno de los productos del carrito es inválido.' });
    }
    throw err;
  }
});

// GET /api/orders — admin. Lista pedidos con sus items, opcionalmente por rango de fechas.
router.get('/', requireAdmin, async (req, res) => {
  const { from, to } = req.query;
  const conditions = [];
  const params = [];

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  res.json(await fetchOrdersWithItems(pool, where, params));
});

// PATCH /api/orders/:id/status — admin. Cambia el estado de un pedido.
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUS_IDS.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  const { rows } = await pool.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
  res.json(toOrder(rows[0], itemRows));
});

export default router;
