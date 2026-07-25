import jwt from 'jsonwebtoken';

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
const TOKEN_EXPIRY = '30d';

export function signCustomerToken(customerId) {
  return jwt.sign({ role: 'customer', sub: customerId }, CUSTOMER_JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

// Adjunta req.customerId si viene un Bearer válido, pero nunca bloquea la
// petición — el checkout debe seguir funcionando como invitado.
export function attachCustomerIfPresent(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, CUSTOMER_JWT_SECRET);
      if (payload.role === 'customer') req.customerId = payload.sub;
    } catch {
      // Token inválido/expirado: se ignora, la petición sigue como invitado.
    }
  }
  next();
}

// Para rutas que sí requieren estar logueado (ej. "Mis Pedidos").
export function requireCustomer(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado.' });

  try {
    const payload = jwt.verify(token, CUSTOMER_JWT_SECRET);
    if (payload.role !== 'customer') throw new Error('rol inválido');
    req.customerId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Sesión expirada o inválida.' });
  }
}
