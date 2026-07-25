import { describe, it, expect } from 'vitest';
import { toCSV } from './csv.js';

describe('toCSV', () => {
  const columns = [
    { label: 'Nombre', value: (r) => r.name },
    { label: 'Nota', value: (r) => r.note },
  ];

  it('arma el header y las filas separadas por coma', () => {
    const csv = toCSV([{ name: 'Ana', note: 'ok' }], columns);
    expect(csv).toBe('Nombre,Nota\nAna,ok');
  });

  it('escapa campos que contienen comas entre comillas', () => {
    const csv = toCSV([{ name: 'Cali, Valle', note: 'x' }], columns);
    expect(csv).toContain('"Cali, Valle"');
  });

  it('escapa comillas dobles duplicándolas', () => {
    const csv = toCSV([{ name: 'Diadema "Pro"', note: 'x' }], columns);
    expect(csv).toContain('"Diadema ""Pro"""');
  });

  it('escapa campos con saltos de línea', () => {
    const csv = toCSV([{ name: 'a\nb', note: 'x' }], columns);
    expect(csv).toContain('"a\nb"');
  });

  it('convierte null/undefined a cadena vacía', () => {
    const csv = toCSV([{ name: null, note: undefined }], columns);
    expect(csv).toBe('Nombre,Nota\n,');
  });
});
