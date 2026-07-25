import { describe, it, expect } from 'vitest';
import { formatPrice, buildWhatsAppMessage } from './config.js';

describe('formatPrice', () => {
  it('formatea pesos colombianos con separador de miles', () => {
    expect(formatPrice(289900)).toBe('$289.900');
  });

  it('formatea cero correctamente', () => {
    expect(formatPrice(0)).toBe('$0');
  });
});

describe('buildWhatsAppMessage', () => {
  const order = {
    items: [
      { productName: 'AirPods Pro', unitPrice: 200000, quantity: 1 },
      { productName: 'Cargador 20W', unitPrice: 40000, quantity: 2 },
    ],
    subtotal: 280000,
    shippingCost: 8000,
    total: 288000,
    paymentMethod: 'transferencia',
  };
  const customerInfo = { name: 'Ana', phone: '3001234567', notes: '' };
  const shippingInfo = { type: 'local', city: 'Palmira', address: 'Calle 1 # 2-3' };

  it('incluye los productos, el total y el método de pago', () => {
    const msg = buildWhatsAppMessage(order, customerInfo, shippingInfo);
    expect(msg).toContain('AirPods Pro x1');
    expect(msg).toContain('Cargador 20W x2');
    expect(msg).toContain('$288.000');
    expect(msg).toContain('Transferencia');
  });

  it('usa "Sin notas adicionales" cuando no hay notas', () => {
    const msg = buildWhatsAppMessage(order, customerInfo, shippingInfo);
    expect(msg).toContain('Sin notas adicionales');
  });

  it('muestra la ciudad para envío local y la transportadora para nacional', () => {
    const local = buildWhatsAppMessage(order, customerInfo, shippingInfo);
    expect(local).toContain('Ciudad: Palmira');

    const national = buildWhatsAppMessage(
      order,
      customerInfo,
      { type: 'national', carrier: 'Envía', address: 'Calle 1 # 2-3' }
    );
    expect(national).toContain('Transportadora: Envía');
  });
});
