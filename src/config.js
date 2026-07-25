// ========================================
// Voltix Tech - Configuración Central
// ========================================

import { CATEGORIES, SHIPPING_COSTS, PAYMENT_METHODS, ORDER_STATUSES } from '../shared/constants.js';
export { CATEGORIES, SHIPPING_COSTS, PAYMENT_METHODS, ORDER_STATUSES };

// Número de WhatsApp del comercio (formato internacional sin +)
export const WHATSAPP_NUMBER = '573226590659';

// Moneda
export const CURRENCY = 'COP';
export const CURRENCY_SYMBOL = '$';

// Formato de precio en pesos colombianos
export function formatPrice(price) {
  return `${CURRENCY_SYMBOL}${price.toLocaleString('es-CO')}`;
}

// Ciudades de envío local (Valle del Cauca)
export const LOCAL_CITIES = [
  'Palmira',
  'Cali',
  'Pradera',
  'Candelaria',
  'Florida',
];

// Transportadoras nacionales
export const NATIONAL_CARRIERS = [
  'Envía',
  'Interrapidísimo',
];

// Genera el mensaje de WhatsApp a partir de un pedido ya confirmado por el servidor
// (order: { items: [{productName, unitPrice, quantity}], subtotal, shippingCost, total, paymentMethod })
export function buildWhatsAppMessage(order, customerInfo, shippingInfo) {
  const itemLines = order.items.map(
    (item) =>
      `• ${item.productName} x${item.quantity} — ${formatPrice(item.unitPrice * item.quantity)}`
  );

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label || order.paymentMethod;

  const lines = [
    `🛒 *Nuevo Pedido — Voltix Tech*`,
    ``,
    `👤 *Cliente:* ${customerInfo.name}`,
    `📱 *Teléfono:* ${customerInfo.phone}`,
    ``,
    `📦 *Productos:*`,
    ...itemLines,
    ``,
    `💰 *Subtotal:* ${formatPrice(order.subtotal)}`,
    `🚚 *Envío (${shippingInfo.type === 'local' ? 'Local' : 'Nacional'}):* ${formatPrice(order.shippingCost)}`,
    `💵 *Total:* ${formatPrice(order.total)}`,
    `💳 *Método de pago:* ${paymentLabel}`,
    ``,
    `📍 *Envío:*`,
    shippingInfo.type === 'local'
      ? `Ciudad: ${shippingInfo.city}`
      : `Transportadora: ${shippingInfo.carrier}`,
    `Dirección: ${shippingInfo.address}`,
    ``,
    `📝 *Notas:* ${customerInfo.notes || 'Sin notas adicionales'}`,
  ];

  return lines.join('\n');
}

// Generar URL de WhatsApp
export function getWhatsAppURL(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
