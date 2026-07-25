import { Router } from 'express';
import { put } from '@vercel/blob';
import {
  verifyAdminCredentials,
  signAdminToken,
  requireAdmin,
  isRateLimited,
  registerFailedAttempt,
  clearFailedAttempts,
} from '../lib/adminAuth.js';

const router = Router();

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Demasiados intentos fallidos. Intenta de nuevo más tarde.' });
  }

  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
  }

  if (!verifyAdminCredentials(email, password)) {
    registerFailedAttempt(ip);
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  clearFailedAttempts(ip);
  res.json({ token: signAdminToken(), email: process.env.ADMIN_EMAIL });
});

// GET /api/admin/me — valida el token guardado en el navegador
router.get('/me', requireAdmin, (req, res) => {
  res.json({ email: process.env.ADMIN_EMAIL });
});

// POST /api/admin/upload?filename=foo.webp — sube una imagen a Vercel Blob
router.post('/upload', requireAdmin, async (req, res) => {
  const rawName = String(req.query.filename || 'imagen');
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80);

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }
  if (req.body.length > 8 * 1024 * 1024) {
    return res.status(400).json({ error: 'La imagen no puede pesar más de 8MB.' });
  }

  const blob = await put(`products/${Date.now()}-${safeName}`, req.body, {
    access: 'public',
    contentType: req.headers['content-type'] || 'application/octet-stream',
  });

  res.status(201).json({ url: blob.url });
});

export default router;
