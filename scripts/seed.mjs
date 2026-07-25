// Script de siembra — se corre UNA VEZ con `npm run seed`, después de conectar
// Postgres y Blob al proyecto (y de hacer `vercel env pull .env.local`).
// No puede importar src/config.js (usa import.meta.env / assets de Vite),
// así que los datos de los 6 productos actuales están copiados literalmente aquí.
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Pool } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'src', 'assets');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('Falta DATABASE_URL. Corre `vercel env pull .env.local` primero.');
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Falta BLOB_READ_WRITE_TOKEN. Corre `vercel env pull .env.local` primero.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function uploadAsset(filename) {
  const filePath = path.join(assetsDir, filename);
  const buffer = readFileSync(filePath);
  const blob = await put(`products/seed-${filename}`, buffer, {
    access: 'public',
    contentType: 'image/webp',
    addRandomSuffix: false,
  });
  console.log(`  ✓ ${filename} -> ${blob.url}`);
  return blob.url;
}

async function main() {
  console.log('Creando esquema (si no existe)...');
  await pool.query(`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_type TEXT NOT NULL,
      shipping_city TEXT,
      shipping_carrier TEXT,
      shipping_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      notes TEXT,
      subtotal INTEGER NOT NULL,
      shipping_cost INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at);
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
  `);

  console.log('Subiendo imágenes a Vercel Blob...');
  const airpodsBundleUrl = await uploadAsset('airpods_bundle.webp');
  const airpodsProUrl = await uploadAsset('airpods_pro.webp');
  const cargadorUrl = await uploadAsset('cargador_gan.webp');
  const diademaUrl = await uploadAsset('diadema_gamer.webp');

  const products = [
    {
      id: 'air-001',
      name: 'AirPods Pro 2da Gen. — Bundle Completo',
      shortName: 'AirPods Pro Bundle',
      description: 'Bundle premium: AirPods Pro 2da generación con estuche MagSafe, cable USB-C a Lightning original y cargador de pared 20W. Todo lo que necesitas, listo para usar.',
      longDescription: 'Lleva tu experiencia de audio al siguiente nivel con este bundle completo de AirPods Pro de 2da generación. Incluye los audífonos con cancelación activa de ruido de nivel profesional, estuche de carga MagSafe con altavoz integrado y ranura para correa, cable USB-C a Lightning original de 1 metro, y cargador de pared de 20W para que no te falte nada desde el primer momento.',
      price: 289900,
      originalPrice: 389900,
      category: 'audifonos',
      image: airpodsBundleUrl,
      images: [airpodsBundleUrl, airpodsProUrl, cargadorUrl],
      badge: 'Más vendido',
      stock: 20,
      features: ['ANC', 'MagSafe', 'Cable + Cargador', 'Envío Gratis'],
      specs: [
        { label: 'Modelo', value: 'AirPods Pro 2da Generación' },
        { label: 'Conectividad', value: 'Bluetooth 5.3' },
        { label: 'Cancelación de Ruido', value: 'ANC Activa + Transparencia' },
        { label: 'Audio', value: 'Espacial con seguimiento dinámico' },
        { label: 'Batería', value: 'Hasta 6h (30h con estuche)' },
        { label: 'Carga', value: 'MagSafe / USB-C / Qi' },
        { label: 'Resistencia', value: 'IPX4 (audífonos y estuche)' },
        { label: 'Incluye', value: 'AirPods + Estuche + Cable USB-C + Cargador 20W' },
      ],
      highlights: [
        '🎵 Cancelación de ruido adaptativa de última generación',
        '🔋 Hasta 30 horas de reproducción con el estuche',
        '📦 Bundle completo: cable + cargador incluidos',
        '🚚 Envío gratis a nivel local',
      ],
    },
    {
      id: 'air-002',
      name: 'AirPods Pro 2da Generación',
      shortName: 'AirPods Pro 2',
      description: 'AirPods Pro de 2da generación con cancelación activa de ruido, modo transparencia adaptativo, audio espacial personalizado y estuche de carga MagSafe con USB-C.',
      longDescription: 'Los AirPods Pro de 2da generación ofrecen una experiencia de sonido inmersiva como nunca antes. Con el chip H2 de Apple, la cancelación activa de ruido elimina hasta el doble de ruido exterior. El modo transparencia adaptativo te permite escuchar tu entorno cuando lo necesitas. El audio espacial personalizado se adapta a la forma única de tus oídos para un sonido envolvente perfecto.',
      price: 219900,
      originalPrice: 299900,
      category: 'audifonos',
      image: airpodsProUrl,
      images: [airpodsProUrl, airpodsBundleUrl],
      badge: 'Premium',
      stock: 20,
      features: ['Bluetooth 5.3', 'ANC', 'Audio Espacial', 'USB-C'],
      specs: [
        { label: 'Modelo', value: 'AirPods Pro 2da Generación' },
        { label: 'Chip', value: 'Apple H2' },
        { label: 'Conectividad', value: 'Bluetooth 5.3' },
        { label: 'Cancelación de Ruido', value: 'ANC Activa + Transparencia Adaptativa' },
        { label: 'Audio', value: 'Espacial personalizado' },
        { label: 'Batería', value: 'Hasta 6h (30h con estuche)' },
        { label: 'Carga', value: 'USB-C / MagSafe / Qi' },
        { label: 'Resistencia', value: 'IPX4' },
      ],
      highlights: [
        '🎵 Chip H2 con cancelación de ruido 2x más potente',
        '👂 Modo transparencia adaptativo inteligente',
        '🔊 Audio espacial personalizado para tus oídos',
        '🔋 30h totales de reproducción con estuche',
      ],
    },
    {
      id: 'car-001',
      name: 'Cargador GaN 65W USB-C',
      shortName: 'Cargador GaN 65W',
      description: 'Cargador ultracompacto con tecnología GaN III. Doble puerto USB-C + USB-A. Carga rápida PD 3.0 compatible con laptops, tablets y smartphones.',
      longDescription: 'La tecnología GaN III permite que este cargador de 65W sea hasta un 40% más pequeño que un cargador convencional. Con doble puerto USB-C y un puerto USB-A, puedes cargar hasta 3 dispositivos simultáneamente. Compatible con Power Delivery 3.0 y Quick Charge 4.0 para la carga más rápida posible en laptops, tablets, smartphones y consolas portátiles.',
      price: 64900,
      originalPrice: 89900,
      category: 'cargadores',
      image: cargadorUrl,
      images: [cargadorUrl],
      badge: 'Nuevo',
      stock: 20,
      features: ['GaN III', '65W', 'PD 3.0', 'Compacto'],
      specs: [
        { label: 'Tecnología', value: 'GaN III (Nitruro de Galio)' },
        { label: 'Potencia', value: '65W máximo' },
        { label: 'Puertos', value: '2x USB-C + 1x USB-A' },
        { label: 'Protocolos', value: 'PD 3.0 / QC 4.0 / PPS' },
        { label: 'Entrada', value: '100-240V AC (Universal)' },
        { label: 'Protección', value: 'Sobrecarga, sobretensión, temperatura' },
        { label: 'Peso', value: '120g aprox.' },
        { label: 'Compatibilidad', value: 'MacBook, iPhone, Samsung, Nintendo Switch' },
      ],
      highlights: [
        '⚡ 65W de potencia para cargar hasta laptops',
        '🔌 3 puertos: carga 3 dispositivos a la vez',
        '📐 40% más pequeño que un cargador convencional',
        '🌍 Voltaje universal 100-240V para viajar',
      ],
    },
    {
      id: 'car-002',
      name: 'Cargador USB-C 20W Apple',
      shortName: 'Cargador 20W',
      description: 'Cargador original Apple de 20W con puerto USB-C. Carga rápida para iPhone y AirPods. Diseño compacto y seguro con certificación oficial.',
      longDescription: 'El cargador Apple de 20W con USB-C es el compañero perfecto para tu iPhone y AirPods. Con carga rápida, lleva tu iPhone del 0% al 50% en solo 30 minutos. Su diseño ultracompacto y su certificación oficial garantizan la máxima seguridad y durabilidad para tus dispositivos Apple.',
      price: 39900,
      originalPrice: 54900,
      category: 'cargadores',
      image: cargadorUrl,
      images: [cargadorUrl],
      badge: 'Oferta',
      stock: 0,
      features: ['20W', 'USB-C', 'Original', 'Compacto'],
      specs: [
        { label: 'Potencia', value: '20W' },
        { label: 'Puerto', value: 'USB-C' },
        { label: 'Protocolo', value: 'Power Delivery (PD)' },
        { label: 'Entrada', value: '100-240V AC' },
        { label: 'Certificación', value: 'Apple MFi' },
        { label: 'Carga Rápida', value: '0-50% en 30 min (iPhone)' },
        { label: 'Compatibilidad', value: 'iPhone, AirPods, iPad mini' },
        { label: 'Peso', value: '60g aprox.' },
      ],
      highlights: [
        '⚡ Carga rápida: 0 a 50% en 30 minutos',
        '✅ Certificación Apple original',
        '🔒 Protección integrada contra sobrecarga',
        '📱 Perfecto para iPhone 15/16 y AirPods Pro',
      ],
    },
    {
      id: 'dia-001',
      name: 'Diadema HD Pro Gaming',
      shortName: 'Diadema HD Pro',
      description: 'Diadema over-ear con drivers de 50mm, sonido envolvente 7.1 virtual, micrófono retráctil con cancelación de ruido y almohadillas de espuma con memoria.',
      longDescription: 'Sumérgete en el juego con la Diadema HD Pro Gaming. Sus drivers de 50mm de neodimio entregan un sonido potente y detallado con graves profundos. El sonido envolvente 7.1 virtual te da ventaja competitiva al detectar cada paso enemigo con precisión. El micrófono retráctil con cancelación de ruido asegura comunicación cristalina con tu equipo.',
      price: 119900,
      originalPrice: 169900,
      category: 'diademas',
      image: diademaUrl,
      images: [diademaUrl],
      badge: null,
      stock: 20,
      features: ['7.1 Virtual', '50mm Driver', 'Mic ANC', 'Memory Foam'],
      specs: [
        { label: 'Tipo', value: 'Over-ear cerrado' },
        { label: 'Drivers', value: '50mm Neodimio' },
        { label: 'Sonido', value: '7.1 Virtual Surround' },
        { label: 'Micrófono', value: 'Retráctil con ANC' },
        { label: 'Conectividad', value: 'USB / Jack 3.5mm' },
        { label: 'Impedancia', value: '32 Ω' },
        { label: 'Almohadillas', value: 'Espuma con memoria' },
        { label: 'Compatibilidad', value: 'PC, PS5, Xbox, Switch, Móvil' },
      ],
      highlights: [
        '🎮 Sonido envolvente 7.1 para ventaja competitiva',
        '🎤 Micrófono retráctil con cancelación de ruido',
        '🧠 Almohadillas memory foam para sesiones largas',
        '🔌 Compatible con PC, consolas y móvil',
      ],
    },
    {
      id: 'dia-002',
      name: 'Diadema Office Comfort',
      shortName: 'Diadema Office',
      description: 'Diadema ligera para trabajo remoto y llamadas. Micrófono con brazo flexible, cancelación de eco, USB-C plug & play. Comodidad todo el día.',
      longDescription: 'Diseñada para profesionales que trabajan desde casa. La Diadema Office Comfort combina comodidad extrema con audio claro para videollamadas. Su micrófono con brazo flexible y cancelación de eco garantiza que tu voz se escuche nítida en Zoom, Teams y Meet. Conexión USB-C plug & play sin drivers necesarios.',
      price: 79900,
      originalPrice: 109900,
      category: 'diademas',
      image: diademaUrl,
      images: [diademaUrl],
      badge: null,
      stock: 20,
      features: ['USB-C', 'Plug & Play', 'Echo Cancel', 'Ultraligera'],
      specs: [
        { label: 'Tipo', value: 'On-ear ligero' },
        { label: 'Drivers', value: '40mm' },
        { label: 'Micrófono', value: 'Brazo flexible con cancelación de eco' },
        { label: 'Conectividad', value: 'USB-C (Plug & Play)' },
        { label: 'Peso', value: '180g' },
        { label: 'Cable', value: '1.8m con control en línea' },
        { label: 'Almohadillas', value: 'Cuero sintético transpirable' },
        { label: 'Compatibilidad', value: 'PC, Mac, Chromebook' },
      ],
      highlights: [
        '💼 Diseñada para trabajo remoto profesional',
        '🎤 Cancelación de eco para llamadas cristalinas',
        '🪶 Solo 180g: comodidad todo el día',
        '🔌 USB-C plug & play, sin drivers',
      ],
    },
  ];

  console.log('Insertando productos...');
  for (const p of products) {
    await pool.query(
      `INSERT INTO products
        (id, name, short_name, description, long_description, price, original_price, category, image, images, badge, features, specs, highlights, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, short_name = EXCLUDED.short_name, description = EXCLUDED.description,
        long_description = EXCLUDED.long_description, price = EXCLUDED.price, original_price = EXCLUDED.original_price,
        category = EXCLUDED.category, image = EXCLUDED.image, images = EXCLUDED.images, badge = EXCLUDED.badge,
        features = EXCLUDED.features, specs = EXCLUDED.specs, highlights = EXCLUDED.highlights,
        updated_at = now()`,
      [
        p.id, p.name, p.shortName, p.description, p.longDescription, p.price, p.originalPrice,
        p.category, p.image, JSON.stringify(p.images), p.badge,
        JSON.stringify(p.features), JSON.stringify(p.specs), JSON.stringify(p.highlights), p.stock,
      ]
    );
    console.log(`  ✓ ${p.id} — ${p.name}`);
  }

  console.log('\n¡Listo! 6 productos sembrados en Postgres.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
