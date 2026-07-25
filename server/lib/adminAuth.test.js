import { describe, it, expect, afterEach, vi } from 'vitest';
import { isRateLimited, registerFailedAttempt, clearFailedAttempts } from './adminAuth.js';

describe('rate limiter de intentos fallidos', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('no bloquea una IP sin intentos previos', () => {
    expect(isRateLimited('1.1.1.1')).toBe(false);
  });

  it('bloquea después de alcanzar el máximo de intentos fallidos', () => {
    const ip = '2.2.2.2';
    for (let i = 0; i < 7; i++) registerFailedAttempt(ip);
    expect(isRateLimited(ip)).toBe(false);

    registerFailedAttempt(ip); // intento número 8
    expect(isRateLimited(ip)).toBe(true);
  });

  it('clearFailedAttempts desbloquea la IP', () => {
    const ip = '3.3.3.3';
    for (let i = 0; i < 8; i++) registerFailedAttempt(ip);
    expect(isRateLimited(ip)).toBe(true);

    clearFailedAttempts(ip);
    expect(isRateLimited(ip)).toBe(false);
  });

  it('el bloqueo expira pasada la ventana de tiempo', () => {
    vi.useFakeTimers();
    const ip = '4.4.4.4';
    for (let i = 0; i < 8; i++) registerFailedAttempt(ip);
    expect(isRateLimited(ip)).toBe(true);

    vi.advanceTimersByTime(11 * 60 * 1000); // 11 min > ventana de 10 min
    expect(isRateLimited(ip)).toBe(false);
  });

  it('no mezcla los contadores de IPs distintas', () => {
    const ipA = '5.5.5.5';
    const ipB = '6.6.6.6';
    for (let i = 0; i < 8; i++) registerFailedAttempt(ipA);
    expect(isRateLimited(ipA)).toBe(true);
    expect(isRateLimited(ipB)).toBe(false);
  });
});
