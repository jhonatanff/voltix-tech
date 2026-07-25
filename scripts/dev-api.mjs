// Servidor local para desarrollar contra /api sin depender de `vercel dev`
// (que resultó poco confiable en este entorno). Usa la misma app Express
// que corre en producción (server/app.js) — mismo código, solo el .listen()
// vive aquí en vez de en la función serverless de Vercel.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });

const { default: app } = await import('../server/app.js');

const port = process.env.API_PORT || 4000;
app.listen(port, () => {
  console.log(`API local escuchando en http://localhost:${port}`);
});
