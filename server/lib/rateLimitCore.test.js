import { describe, it, expect } from 'vitest';
import { computeIsRateLimited, MAX_ATTEMPTS, WINDOW_MS } from './rateLimitCore.js';

describe('computeIsRateLimited', () => {
  it('no bloquea sin intentos previos', () => {
    expect(computeIsRateLimited(undefined)).toBe(false);
  });

  it('no bloquea por debajo del máximo de intentos', () => {
    const now = Date.now();
    const entry = { attempt_count: MAX_ATTEMPTS - 1, first_attempt_at: new Date(now).toISOString() };
    expect(computeIsRateLimited(entry, now)).toBe(false);
  });

  it('bloquea al alcanzar el máximo de intentos dentro de la ventana', () => {
    const now = Date.now();
    const entry = { attempt_count: MAX_ATTEMPTS, first_attempt_at: new Date(now).toISOString() };
    expect(computeIsRateLimited(entry, now)).toBe(true);
  });

  it('el bloqueo expira pasada la ventana de tiempo', () => {
    const start = Date.now();
    const entry = { attempt_count: MAX_ATTEMPTS, first_attempt_at: new Date(start).toISOString() };
    const later = start + WINDOW_MS + 60 * 1000;
    expect(computeIsRateLimited(entry, later)).toBe(false);
  });
});
