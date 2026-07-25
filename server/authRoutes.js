import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'voltix-dev-secret-change-me';
const TOKEN_EXPIRY = '7d';

const router = Router();

function toPublicUser(row) {
  return { id: row.id, name: row.name, phone: row.phone, email: row.email };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

router.post('/register', (req, res) => {
  const { name, phone, email, password } = req.body || {};

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, phone, email, password_hash) VALUES (?, ?, ?, ?)')
    .run(name.trim(), phone.trim(), normalizedEmail, passwordHash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = signToken(user.id);

  res.status(201).json({ token, user: toPublicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  const token = signToken(user.id);
  res.json({ token, user: toPublicUser(user) });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'No autenticado.' });
    res.json({ user: toPublicUser(user) });
  } catch {
    res.status(401).json({ error: 'Sesión expirada o inválida.' });
  }
});

export default router;
