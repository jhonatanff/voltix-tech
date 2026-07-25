import { pool } from './db.js';
import { computeIsRateLimited, WINDOW_MS } from './rateLimitCore.js';

// Freno de fuerza bruta persistido en Postgres — sobrevive a los cold starts
// de Vercel, a diferencia de un Map en memoria. `scope` separa los contadores
// de distintos formularios de login (admin, cliente) para que uno no bloquee al otro.

export function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function keyFor(scope, identifier) {
  return `${scope}:${identifier}`;
}

export async function isRateLimited(scope, identifier) {
  const { rows } = await pool.query(
    'SELECT attempt_count, first_attempt_at FROM login_attempts WHERE key = $1',
    [keyFor(scope, identifier)]
  );
  return computeIsRateLimited(rows[0]);
}

export async function registerFailedAttempt(scope, identifier) {
  const key = keyFor(scope, identifier);
  const { rows } = await pool.query(
    'SELECT attempt_count, first_attempt_at FROM login_attempts WHERE key = $1',
    [key]
  );
  const entry = rows[0];
  const now = Date.now();
  const withinWindow = entry && now - new Date(entry.first_attempt_at).getTime() <= WINDOW_MS;

  if (withinWindow) {
    await pool.query('UPDATE login_attempts SET attempt_count = attempt_count + 1 WHERE key = $1', [key]);
  } else {
    await pool.query(
      `INSERT INTO login_attempts (key, attempt_count, first_attempt_at) VALUES ($1, 1, now())
       ON CONFLICT (key) DO UPDATE SET attempt_count = 1, first_attempt_at = now()`,
      [key]
    );
  }
}

export async function clearFailedAttempts(scope, identifier) {
  await pool.query('DELETE FROM login_attempts WHERE key = $1', [keyFor(scope, identifier)]);
}
