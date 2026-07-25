import { describe, it, expect } from 'vitest';
import { generateProductId } from './ids.js';

describe('generateProductId', () => {
  it('slugifica el nombre y le agrega un sufijo único', () => {
    const id = generateProductId('AirPods Pro');
    expect(id).toMatch(/^airpods-pro-[a-f0-9]{6}$/);
  });

  it('quita tildes y caracteres especiales', () => {
    const id = generateProductId('Diadema Última Edición!');
    expect(id.startsWith('diadema-ultima-edicion-')).toBe(true);
  });

  it('colapsa espacios y símbolos repetidos en un solo guion', () => {
    const id = generateProductId('Cargador   GaN -- 65W');
    expect(id.startsWith('cargador-gan-65w-')).toBe(true);
  });

  it('nunca deja guiones al inicio o al final del slug', () => {
    const id = generateProductId('  ¡Hola!  ');
    const slug = id.replace(/-[a-f0-9]{6}$/, '');
    expect(slug.startsWith('-')).toBe(false);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('genera IDs distintos para el mismo nombre (sufijo aleatorio)', () => {
    const a = generateProductId('Producto');
    const b = generateProductId('Producto');
    expect(a).not.toBe(b);
  });

  it('usa un slug de respaldo cuando el nombre queda vacío', () => {
    const id = generateProductId('!!!');
    expect(id.startsWith('producto-')).toBe(true);
  });
});
