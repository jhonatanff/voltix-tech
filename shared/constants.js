// ========================================
// Constantes compartidas entre el frontend (src/config.js)
// y el backend (api/_app.js) — sin imports de Vite/assets,
// para poder usarse desde Node puro.
// ========================================

// Categorías de filtro / clasificación de productos
export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'audifonos', label: 'Audífonos' },
  { id: 'cargadores', label: 'Cargadores' },
  { id: 'diademas', label: 'Diademas' },
];

// Ids de categoría válidos para un producto (excluye "todos", que es solo un filtro de UI)
export const PRODUCT_CATEGORY_IDS = CATEGORIES.filter((c) => c.id !== 'todos').map((c) => c.id);

// Costos de envío
export const SHIPPING_COSTS = {
  local: 8000,
  national: 15000,
};

// Métodos de pago disponibles
export const PAYMENT_METHODS = [
  { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
];

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((m) => m.id);
