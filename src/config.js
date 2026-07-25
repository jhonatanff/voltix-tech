// ========================================
// Voltix Tech - Configuración Central
// ========================================

import airpodsBundleImg from './assets/airpods_bundle.webp';
import airpodsProImg from './assets/airpods_pro.webp';
import cargadorImg from './assets/cargador_gan.webp';
import diademaImg from './assets/diadema_gamer.webp';

// Número de WhatsApp del comercio (formato internacional sin +)
export const WHATSAPP_NUMBER = '573226590659';

// URL base de la API del backend (registro / login)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Moneda
export const CURRENCY = 'COP';
export const CURRENCY_SYMBOL = '$';

// Formato de precio en pesos colombianos
export function formatPrice(price) {
  return `${CURRENCY_SYMBOL}${price.toLocaleString('es-CO')}`;
}

// Catálogo de productos
export const PRODUCTS = [
  {
    id: 'air-001',
    name: 'AirPods Pro 2da Gen. — Bundle Completo',
    shortName: 'AirPods Pro Bundle',
    description: 'Bundle premium: AirPods Pro 2da generación con estuche MagSafe, cable USB-C a Lightning original y cargador de pared 20W. Todo lo que necesitas, listo para usar.',
    longDescription: 'Lleva tu experiencia de audio al siguiente nivel con este bundle completo de AirPods Pro de 2da generación. Incluye los audífonos con cancelación activa de ruido de nivel profesional, estuche de carga MagSafe con altavoz integrado y ranura para correa, cable USB-C a Lightning original de 1 metro, y cargador de pared de 20W para que no te falte nada desde el primer momento.',
    price: 289900,
    originalPrice: 389900,
    category: 'audifonos',
    image: airpodsBundleImg,
    images: [airpodsBundleImg, airpodsProImg, cargadorImg],
    badge: 'Más vendido',
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
    image: airpodsProImg,
    images: [airpodsProImg, airpodsBundleImg],
    badge: 'Premium',
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
    image: cargadorImg,
    images: [cargadorImg],
    badge: 'Nuevo',
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
    image: cargadorImg,
    images: [cargadorImg],
    badge: 'Oferta',
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
    image: diademaImg,
    images: [diademaImg],
    badge: null,
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
    image: diademaImg,
    images: [diademaImg],
    badge: null,
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

// Categorías de filtro
export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'audifonos', label: 'Audífonos' },
  { id: 'cargadores', label: 'Cargadores' },
  { id: 'diademas', label: 'Diademas' },
];

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

// Generar mensaje para WhatsApp
export function buildWhatsAppMessage(cart, customerInfo, shippingInfo, paymentMethod) {
  const itemLines = cart.map(
    (item) =>
      `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost =
    shippingInfo.type === 'local'
      ? SHIPPING_COSTS.local
      : SHIPPING_COSTS.national;
  const total = subtotal + shippingCost;

  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod;

  const lines = [
    `🛒 *Nuevo Pedido — Voltix Tech*`,
    ``,
    `👤 *Cliente:* ${customerInfo.name}`,
    `📱 *Teléfono:* ${customerInfo.phone}`,
    ``,
    `📦 *Productos:*`,
    ...itemLines,
    ``,
    `💰 *Subtotal:* ${formatPrice(subtotal)}`,
    `🚚 *Envío (${shippingInfo.type === 'local' ? 'Local' : 'Nacional'}):* ${formatPrice(shippingCost)}`,
    `💵 *Total:* ${formatPrice(total)}`,
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
