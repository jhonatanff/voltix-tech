# Voltix Tech

E-commerce de tecnología (audífonos, cargadores, diademas) para el mercado colombiano. React 19 + Vite en el frontend, Express sobre una única función serverless de Vercel en el backend, Postgres (Neon) como base de datos y Vercel Blob para las imágenes de producto. El checkout es siempre por WhatsApp — no hay pasarela de pago integrada.

Producción: [voltix-tech.vercel.app](https://voltix-tech.vercel.app)

## Stack

- **Frontend**: React 19, Vite, React Router 7 (SPA con rutas cliente)
- **Backend**: Express 5, empaquetado como una sola función serverless (`api/index.js` envuelve `server/app.js`) — necesario porque el plan Hobby de Vercel limita a 12 funciones por deployment
- **Base de datos**: Postgres vía [Neon](https://neon.tech) (integración de Vercel Marketplace), acceso con `@neondatabase/serverless`
- **Imágenes**: Vercel Blob (`@vercel/blob`)
- **Auth**: JWT (`jsonwebtoken`) + `bcryptjs` — admin único por variables de entorno, clientes en una tabla real
- **Correo**: [Resend](https://resend.com) para avisar al admin de cada pedido nuevo
- **Tests**: Vitest (solo lógica pura, sin integración contra la base de datos real)

## Funcionalidad

- Catálogo público con detalle de producto, control de stock y productos relacionados
- Carrito persistente (`localStorage`), reconciliado contra el catálogo real al cargar la página (precios/stock actualizados, productos eliminados se quitan solos)
- Checkout por WhatsApp con selección de método de pago y tipo de envío
- Cuentas de cliente opcionales (el checkout como invitado siempre funciona) con historial de pedidos
- Panel de administración (`/admin`) con:
  - Gestión de productos (crear/editar/eliminar con papelera y restauración)
  - Órdenes: cambio de estado, nota interna visible para el cliente, exportación CSV
  - Dashboard de ventas y reportes
  - Gestión de usuarios registrados (crear/editar/eliminar)
- Rate-limit de fuerza bruta en los dos logins (admin y cliente), persistido en Postgres para sobrevivir a los cold starts de Vercel
- Cabeceras de seguridad (Helmet en la API, headers estáticos en `vercel.json` para el resto del sitio)

## Estructura del proyecto

```
api/              Función serverless de Vercel (solo el entry point — Vercel trata
                   cada archivo bajo api/ como una función, así que la app real vive
                   afuera, en server/)
server/           Express app (rutas, lib de negocio) — la misma app corre en
                   local (scripts/dev-api.mjs) y en producción (api/index.js)
  routes/         Un router por recurso (products, orders, admin, customers...)
  lib/            DB, auth, rate-limit, notificaciones, serialización compartida
shared/           Constantes usadas tanto por el frontend (src/config.js) como
                   por el backend, sin imports de Vite
src/              Frontend React
  admin/          Layout, auth context y helpers del panel de administración
  pages/admin/    Páginas del panel de administración
  pages/          Páginas del sitio público (login, registro, historial)
  hooks/          Hooks compartidos (catálogo, accesibilidad de modales)
  auth/           Contexto de autenticación de clientes
scripts/          seed.mjs (siembra inicial) y dev-api.mjs (servidor local)
```

## Desarrollo local

Requiere Node 18+.

```bash
npm install
cp .env.example .env.local   # completar con tus credenciales (ver más abajo)
npm run seed                 # una sola vez, siembra productos y sube sus imágenes
npm run dev:full             # levanta Vite (5173) + la API Express (4000) juntos
```

`vercel dev` no se usa para el desarrollo local — resultó poco confiable en este entorno. En su lugar, `scripts/dev-api.mjs` corre la misma app Express (`server/app.js`) con `.listen()`, y Vite hace proxy de `/api` hacia ese puerto (ver `vite.config.js`).

### Variables de entorno

Ver `.env.example` para la lista completa. Se obtienen así:

- `DATABASE_URL` / `POSTGRES_URL`: se generan solos al conectar la integración de Neon en el proyecto de Vercel — bájalas con `vercel env pull .env.local`
- `BLOB_READ_WRITE_TOKEN`: igual, viene de la integración de Vercel Blob
- `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`: credenciales del único usuario admin — el hash se genera con `bcrypt.hashSync(password, 10)`
- `ADMIN_JWT_SECRET` / `CUSTOMER_JWT_SECRET`: cualquier string largo y aleatorio, uno para cada tipo de sesión
- `RESEND_API_KEY` / `ADMIN_NOTIFICATION_EMAIL`: opcionales — sin ellos, simplemente no se envía el correo de aviso de pedido nuevo

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Solo el frontend (Vite) |
| `npm run dev:api` | Solo la API local |
| `npm run dev:full` | Frontend + API juntos (lo normal para desarrollar) |
| `npm run build` | Build de producción del frontend |
| `npm run lint` | Oxlint sobre todo el proyecto |
| `npm test` | Vitest (tests unitarios) |
| `npm run seed` | Siembra productos iniciales en la base y sube sus imágenes a Blob |

## Despliegue

El proyecto está conectado a Vercel. Cada push a `main` en GitHub dispara un deploy; para desplegar manualmente:

```bash
vercel deploy --prod
```

`vercel.json` define los rewrites que enrutan `/api/*` a la función serverless y un fallback de SPA para todo lo demás, además de las cabeceras de seguridad para las respuestas estáticas.

## Tests y CI

`npm test` corre en cada push/PR vía GitHub Actions (`.github/workflows/ci.yml`), junto con lint y build. El alcance de los tests es intencionalmente acotado a lógica pura (generación de ids, CSV, formato de precios, el cálculo del rate-limit) — no hay tests de integración contra Postgres real.
