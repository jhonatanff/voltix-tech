import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db.js';
import { signCustomerToken, requireCustomer } from '../lib/customerAuth.js';
import { fetchOrdersWithItems } from '../lib/orderSerializer.js';

const router = Router();

function toPublicCustomer(row) {
  return { id: row.id, name: row.name, phone: row.phone, email: row.email };
}

// POST /api/customers/register
router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body || {};

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await pool.query('SELECT id FROM customers WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO customers (name, phone, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING *',
    [name.trim(), phone.trim(), normalizedEmail, passwordHash]
  );
  const customer = rows[0];

  res.status(201).json({ token: signCustomerToken(customer.id), user: toPublicCustomer(customer) });
});

// POST /api/customers/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { rows } = await pool.query(
    'SELECT * FROM customers WHERE email = $1 AND deleted_at IS NULL',
    [normalizedEmail]
  );
  const customer = rows[0];

  if (!customer || !bcrypt.compareSync(password, customer.password_hash)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  res.json({ token: signCustomerToken(customer.id), user: toPublicCustomer(customer) });
});

// GET /api/customers/me
router.get('/me', requireCustomer, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL',
    [req.customerId]
  );
  if (rows.length === 0) return res.status(401).json({ error: 'No autenticado.' });
  res.json({ user: toPublicCustomer(rows[0]) });
});

// GET /api/customers/me/orders — historial de pedidos del cliente logueado
router.get('/me/orders', requireCustomer, async (req, res) => {
  const orders = await fetchOrdersWithItems(pool, 'WHERE customer_id = $1', [req.customerId]);
  res.json(orders);
});

export default router;
