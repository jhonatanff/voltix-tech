import { Resend } from 'resend';

const CURRENCY_SYMBOL = '$';
function formatPrice(price) {
  return `${CURRENCY_SYMBOL}${Number(price).toLocaleString('es-CO')}`;
}

// Envía el correo de aviso al admin. Nunca lanza — un fallo de email no
// debe tumbar la respuesta de un pedido que ya se guardó correctamente.
export async function notifyNewOrder(order) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    const itemsHtml = order.items
      .map((i) => `<li>${i.productName} x${i.quantity} — ${formatPrice(i.unitPrice * i.quantity)}</li>`)
      .join('');

    await resend.emails.send({
      from: 'Voltix Tech <onboarding@resend.dev>',
      to,
      subject: `🛒 Nuevo pedido #${order.id} — ${formatPrice(order.total)}`,
      html: `
        <h2>Nuevo pedido — Voltix Tech</h2>
        <p><strong>Cliente:</strong> ${order.customerName}</p>
        <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
        <p><strong>Productos:</strong></p>
        <ul>${itemsHtml}</ul>
        <p><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>
        <p><strong>Envío:</strong> ${formatPrice(order.shippingCost)}</p>
        <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
        <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
        <p><strong>Dirección:</strong> ${order.shippingAddress}</p>
        ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
        <p style="color:#888;font-size:12px;">Pedido #${order.id} — ${new Date(order.createdAt).toLocaleString('es-CO')}</p>
      `,
    });
  } catch (err) {
    console.error('No se pudo enviar el correo de aviso de pedido:', err);
  }
}
