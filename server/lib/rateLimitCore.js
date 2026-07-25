// Lógica pura del freno de fuerza bruta — sin tocar la base de datos, para
// poder probarla de forma aislada. server/lib/rateLimit.js es la capa que
// persiste este mismo cálculo en Postgres.

export const MAX_ATTEMPTS = 8;
export const WINDOW_MS = 10 * 60 * 1000;

// entry: { attempt_count, first_attempt_at } o undefined si nunca hubo intentos.
export function computeIsRateLimited(entry, now = Date.now()) {
  if (!entry) return false;
  const firstAttemptMs = new Date(entry.first_attempt_at).getTime();
  if (now - firstAttemptMs > WINDOW_MS) return false;
  return entry.attempt_count >= MAX_ATTEMPTS;
}
