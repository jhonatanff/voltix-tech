import { Router } from 'express';
import { pool } from '../lib/db.js';
import { requireAdmin } from '../lib/adminAuth.js';
import { generateProductId } from '../lib/ids.js';
import { PRODUCT_CATEGORY_IDS } from '../../shared/constants.js';

const router = Router();

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    longDescription: row.long_description,
    price: row.price,
    originalPrice: row.original_price,
    category: row.category,
    image: row.image,
    images: row.images || [],
    badge: row.badge,
    features: row.features || [],
    specs: row.specs || [],
    highlights: row.highlights || [],
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateProductInput(body, { partial = false } = {}) {
  const errors = [];
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has('name')) {
    if (!body.name?.trim()) errors.push('El nombre es obligatorio.');
  }
  if (!partial || has('shortName')) {
    if (!body.shortName?.trim()) errors.push('El nombre corto es obligatorio.');
  }
  if (!partial || has('price')) {
    if (!Number.isFinite(body.price) || body.price < 0) errors.push('El precio debe ser un número válido.');
  }
  if (!partial || has('category')) {
    if (!PRODUCT_CATEGORY_IDS.includes(body.category)) errors.push('Categoría inválida.');
  }
  if (!partial || has('stock')) {
    if (!Number.isInteger(body.stock) || body.stock < 0) errors.push('El stock debe ser un número entero mayor o igual a 0.');
  }

  return errors;
}

// GET /api/products — catálogo público
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
  res.json(rows.map(toProduct));
});

// GET /api/products/:id — detalle público
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.json(toProduct(rows[0]));
});

// POST /api/products — crear (admin)
router.post('/', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const errors = validateProductInput(body);
  if (errors.length > 0) return res.status(400).json({ error: errors.join(' ') });

  const id = generateProductId(body.name);
  const { rows } = await pool.query(
    `INSERT INTO products
      (id, name, short_name, description, long_description, price, original_price, category, image, images, badge, features, specs, highlights, stock)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      id,
      body.name.trim(),
      body.shortName.trim(),
      body.description || null,
      body.longDescription || null,
      body.price,
      body.originalPrice ?? null,
      body.category,
      body.image || null,
      JSON.stringify(body.images || []),
      body.badge || null,
      JSON.stringify(body.features || []),
      JSON.stringify(body.specs || []),
      JSON.stringify(body.highlights || []),
      body.stock ?? 0,
    ]
  );
  res.status(201).json(toProduct(rows[0]));
});

// PUT /api/products/:id — editar (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const errors = validateProductInput(body, { partial: true });
  if (errors.length > 0) return res.status(400).json({ error: errors.join(' ') });

  const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
  const current = existing.rows[0];

  const merge = (key, dbKey, transform = (v) => v) =>
    Object.prototype.hasOwnProperty.call(body, key) ? transform(body[key]) : current[dbKey];

  const { rows } = await pool.query(
    `UPDATE products SET
      name = $1, short_name = $2, description = $3, long_description = $4,
      price = $5, original_price = $6, category = $7, image = $8, images = $9,
      badge = $10, features = $11, specs = $12, highlights = $13, stock = $14,
      updated_at = now()
     WHERE id = $15
     RETURNING *`,
    [
      merge('name', 'name'),
      merge('shortName', 'short_name'),
      merge('description', 'description'),
      merge('longDescription', 'long_description'),
      merge('price', 'price'),
      merge('originalPrice', 'original_price'),
      merge('category', 'category'),
      merge('image', 'image'),
      JSON.stringify(merge('images', 'images')),
      merge('badge', 'badge'),
      JSON.stringify(merge('features', 'features')),
      JSON.stringify(merge('specs', 'specs')),
      JSON.stringify(merge('highlights', 'highlights')),
      merge('stock', 'stock'),
      req.params.id,
    ]
  );
  res.json(toProduct(rows[0]));
});

// DELETE /api/products/:id — eliminar (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.status(204).end();
});

export default router;
