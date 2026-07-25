import { randomUUID } from 'node:crypto';

const DIACRITICS = /[̀-ͯ]/g;

export function generateProductId(name) {
  const slug = (name || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug || 'producto'}-${randomUUID().slice(0, 6)}`;
}
