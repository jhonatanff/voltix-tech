import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const TOKEN_EXPIRY = '12h';

export function verifyAdminCredentials(email, password) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || normalized !== process.env.ADMIN_EMAIL?.toLowerCase()) return false;
  return bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH || '');
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('rol inválido');
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada o inválida.' });
  }
}
