import { Pool } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error('Falta la variable de entorno DATABASE_URL (conexión a Postgres).');
}

export const pool = new Pool({ connectionString });

// Ejecuta fn(client) dentro de una transacción BEGIN/COMMIT/ROLLBACK.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

let schemaReady = null;

// Crea las tablas si no existen. Idempotente — se puede llamar en cada cold start.
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        description TEXT,
        long_description TEXT,
        price INTEGER NOT NULL,
        original_price INTEGER,
        category TEXT NOT NULL,
        image TEXT,
        images JSONB NOT NULL DEFAULT '[]',
        badge TEXT,
        features JSONB NOT NULL DEFAULT '[]',
        specs JSONB NOT NULL DEFAULT '[]',
        highlights JSONB NOT NULL DEFAULT '[]',
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      );
      ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      );
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        shipping_type TEXT NOT NULL,
        shipping_city TEXT,
        shipping_carrier TEXT,
        shipping_address TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        notes TEXT,
        subtotal INTEGER NOT NULL,
        shipping_cost INTEGER NOT NULL,
        total INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'pendiente',
        admin_note TEXT
      );
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendiente';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
      CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);
      CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
        product_name TEXT NOT NULL,
        unit_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
      CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items (product_id);

      CREATE TABLE IF NOT EXISTS login_attempts (
        key TEXT PRIMARY KEY,
        attempt_count INTEGER NOT NULL DEFAULT 1,
        first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
  return schemaReady;
}
