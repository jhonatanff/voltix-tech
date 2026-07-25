import { Router } from 'express';
import { pool, withTransaction } from '../lib/db.js';
import { requireAdmin } from '../lib/adminAuth.js';
import { SHIPPING_COSTS, PAYMENT_METHOD_IDS } from '../../shared/constants.js';

const router = Router();

class InsufficientStockError extends Error {
  constructor(productId) {
    super('insufficient_stock');
    this.productId = productId;
  }
}

function toOrder(orderRow, itemRows) {
  return {
    id: orderRow.id,
    customerName: orderRow.customer_name,
    customerPhone: orderRow.customer_phone,
    shippingType: orderRow.shipping_type,
    shippingCity: orderRow.shipping_city,
    shippingCarrier: orderRow.shipping_carrier,
    shippingAddress: orderRow.shipping_address,
    paymentMethod: orderRow.payment_method,
    notes: orderRow.notes,
    subtotal: orderRow.subtotal,
    shippingCost: orderRow.shipping_cost,
    total: orderRow.total,
    createdAt: orderRow.created_at,
    items: itemRows.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
    })),
  };
}

// POST /api/orders — pública. Crea el pedido, descuenta stock de forma atómica.
router.post('/', async (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) return res.status(400).json({ error: 'El carrito está vacío.' });
  if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios.' });
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
           WHERE id = $2 AND stock >= $1
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
          (customer_name, customer_phone, shipping_type, shipping_city, shipping_carrier, shipping_address, payment_method, notes, subtotal, shipping_cost, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [
          body.customerName.trim(),
          body.customerPhone.trim(),
          body.shippingType,
          body.shippingCity || null,
          body.shippingCarrier || null,
          body.shippingAddress.trim(),
          body.paymentMethod,
          body.notes || null,
          subtotal,
          shippingCost,
          total,
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
  const { rows: orderRows } = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    params
  );

  if (orderRows.length === 0) return res.json([]);

  const orderIds = orderRows.map((o) => o.id);
  const { rows: itemRows } = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ANY($1)',
    [orderIds]
  );

  const itemsByOrder = new Map();
  for (const item of itemRows) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }

  res.json(orderRows.map((o) => toOrder(o, itemsByOrder.get(o.id) || [])));
});

export default router;
