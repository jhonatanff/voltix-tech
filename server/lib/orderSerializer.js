export function toOrder(orderRow, itemRows) {
  return {
    id: orderRow.id,
    customerName: orderRow.customer_name,
    customerPhone: orderRow.customer_phone,
    customerEmail: orderRow.customer_email,
    shippingType: orderRow.shipping_type,
    shippingCity: orderRow.shipping_city,
    shippingCarrier: orderRow.shipping_carrier,
    shippingAddress: orderRow.shipping_address,
    paymentMethod: orderRow.payment_method,
    notes: orderRow.notes,
    subtotal: orderRow.subtotal,
    shippingCost: orderRow.shipping_cost,
    total: orderRow.total,
    status: orderRow.status,
    createdAt: orderRow.created_at,
    items: itemRows.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
    })),
  };
}

// Trae pedidos + sus items ya agrupados y serializados, dado un WHERE ya armado.
export async function fetchOrdersWithItems(pool, whereSql, params) {
  const { rows: orderRows } = await pool.query(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC`,
    params
  );

  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((o) => o.id);
  const { rows: itemRows } = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ANY($1)',
    [orderIds]
  );

  const itemsByOrder = new Map();
  for (const item of itemRows) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }

  return orderRows.map((o) => toOrder(o, itemsByOrder.get(o.id) || []));
}
