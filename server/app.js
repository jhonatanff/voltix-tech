import express from 'express';
import helmet from 'helmet';
import { ensureSchema } from './lib/db.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
import customersRouter from './routes/customers.js';
import adminCustomersRouter from './routes/adminCustomers.js';

const app = express();

// API pura en JSON — sin CSP (es para páginas HTML, no aplica aquí).
app.use(helmet({ contentSecurityPolicy: false }));

app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    console.error('Error inicializando el esquema de la base de datos:', err);
    res.status(500).json({ error: 'Error de conexión con la base de datos.' });
  }
});

// La subida de imágenes necesita el cuerpo crudo (binario), no JSON.
app.use('/api/admin/upload', express.raw({ type: '*/*', limit: '10mb' }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/customers', customersRouter);
app.use('/api/admin/customers', adminCustomersRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

export default app;
