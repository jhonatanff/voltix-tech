import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db.js';
import { requireAdmin } from '../lib/adminAuth.js';

const router = Router();

function toCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
  };
}

// GET /api/admin/customers — lista usuarios registrados (excluye eliminados)
router.get('/', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM customers WHERE deleted_at IS NULL ORDER BY created_at DESC'
  );
  res.json(rows.map(toCustomer));
});

// POST /api/admin/customers — crear un usuario manualmente
router.post('/', requireAdmin, async (req, res) => {
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
  res.status(201).json(toCustomer(rows[0]));
});

// PUT /api/admin/customers/:id — editar (password opcional, solo si se quiere resetear)
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, phone, email, password } = req.body || {};

  const existing = await pool.query(
    'SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL',
    [req.params.id]
  );
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
  const current = existing.rows[0];

  if (!name?.trim() || !phone?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Nombre, teléfono y correo son obligatorios.' });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== current.email) {
    const emailTaken = await pool.query('SELECT id FROM customers WHERE email = $1 AND id != $2', [
      normalizedEmail,
      req.params.id,
    ]);
    if (emailTaken.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
    }
  }

  const passwordHash = password ? bcrypt.hashSync(password, 10) : current.password_hash;

  const { rows } = await pool.query(
    `UPDATE customers SET name = $1, phone = $2, email = $3, password_hash = $4
     WHERE id = $5 RETURNING *`,
    [name.trim(), phone.trim(), normalizedEmail, passwordHash, req.params.id]
  );
  res.json(toCustomer(rows[0]));
});

// DELETE /api/admin/customers/:id — soft delete
router.delete('/:id', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    'UPDATE customers SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.status(204).end();
});

export default router;
