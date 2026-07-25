// ========================================
// Voltix Tech — Main Application
// ========================================
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import {
  CATEGORIES,
  LOCAL_CITIES,
  NATIONAL_CARRIERS,
  SHIPPING_COSTS,
  PAYMENT_METHODS,
  formatPrice,
  buildWhatsAppMessage,
  getWhatsAppURL,
} from './config';
import { useProducts } from './hooks/useProducts';
import { useModalA11y } from './hooks/useModalA11y';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import voltixLogo from './assets/voltix_logo.webp';
import './index.css';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

// ---- SVG Icon Components ----
function IconCart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ---- Scroll to top / hash on route change ----
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

// ---- Toast Component ----
function Toast({ message, show }) {
  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      <span className="toast-icon">✓</span>
      {message}
    </div>
  );
}

// ---- Navbar Component ----
function Navbar({ cartCount, onCartClick, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const onOrdersPage = pathname === '/mis-pedidos';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img src={voltixLogo} alt="Voltix Tech" className="navbar-logo" />
          <span className="navbar-title">Voltix Tech</span>
        </Link>
        <div className="navbar-actions">
          {user ? (
            onOrdersPage ? (
              <Link to="/" className="account-pill" id="home-nav-link" aria-label="Inicio">
                <IconHome />
                <span>Inicio</span>
              </Link>
            ) : (
              <Link
                to="/mis-pedidos"
                className="account-pill"
                id="my-orders-link"
                title={`Hola, ${user?.name?.split(' ')[0]}`}
                aria-label="Mis pedidos"
              >
                <IconUser />
                <span>Mis pedidos</span>
              </Link>
            )
          ) : (
            <Link to="/login" className="account-pill" id="login-nav-link" aria-label="Iniciar sesión">
              <IconUser />
              <span>Iniciar sesión</span>
            </Link>
          )}
          <button className="cart-btn" onClick={onCartClick} id="cart-toggle-btn" aria-label="Carrito">
            <IconCart />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="cart-badge" key={cartCount}>{cartCount}</span>
            )}
          </button>
          {user && (
            <button className="account-logout-btn" onClick={onLogout} id="logout-btn" aria-label="Salir">
              <IconLogout />
              <span>Salir</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ---- Hero Section ----
function Hero({ onCatalogClick }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Envíos a todo Colombia
        </div>
        <h1>
          Tecnología <span className="gradient-text">Premium</span> al Mejor Precio
        </h1>
        <p className="hero-subtitle">
          Descubre nuestra selección exclusiva de audífonos, cargadores y diademas de última generación.
          Calidad garantizada con envío directo a tu puerta.
        </p>
        <div className="hero-cta-group">
          <button className="btn btn-primary" onClick={onCatalogClick} id="hero-cta-catalog">
            🛍️ Ver Catálogo
          </button>
          <a href="#features" className="btn btn-secondary" id="hero-cta-benefits">
            ✨ Nuestros Beneficios
          </a>
        </div>
      </div>
    </section>
  );
}

// ---- Product Card ----
function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const timerRef = useRef(null);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1200);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const badgeClass =
    product.badge === 'Oferta'
      ? 'badge-orange'
      : product.badge === 'Nuevo'
        ? 'badge-green'
        : '';

  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label || product.category;
  const outOfStock = product.stock <= 0;

  return (
    <Link to={`/producto/${product.id}`} className={`product-card ${outOfStock ? 'out-of-stock' : ''}`} id={`product-${product.id}`}>
      <div className="product-card-image">
        {outOfStock ? (
          <span className="product-badge badge-gray">Agotado</span>
        ) : (
          product.badge && <span className={`product-badge ${badgeClass}`}>{product.badge}</span>
        )}
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{categoryLabel}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-features">
          {product.features.map((f) => (
            <span key={f} className="product-feature-tag">{f}</span>
          ))}
        </div>
        {!outOfStock && (
          <span className="product-card-stock">
            {product.stock <= 5 ? `¡Solo quedan ${product.stock}!` : `${product.stock} disponibles`}
          </span>
        )}
        <div className="product-card-footer">
          <div className="product-price-group">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="product-price-original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            className={`add-to-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={outOfStock}
            id={`add-cart-${product.id}`}
          >
            {outOfStock ? (
              'Agotado'
            ) : added ? (
              <>
                <IconCheck /> Agregado
              </>
            ) : (
              <>
                <IconPlus /> Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ---- Product Gallery ----
function ProductGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] || images[0];

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={active} alt={name} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`gallery-thumb ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagen ${i + 1} de ${name}`}
            >
              <img src={img} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Product Detail Skeleton (mientras carga el catálogo) ----
function ProductDetailSkeleton() {
  return (
    <section className="product-detail-section">
      <div className="container product-not-found">
        <p>Cargando producto...</p>
      </div>
    </section>
  );
}

// ---- Product Not Found ----
function ProductNotFound() {
  return (
    <section className="product-detail-section">
      <div className="container product-not-found">
        <h1>Producto no encontrado</h1>
        <p>El producto que buscas no existe o fue removido del catálogo.</p>
        <Link to="/" className="btn btn-primary" id="not-found-back-btn">
          Volver al catálogo
        </Link>
      </div>
    </section>
  );
}

// ---- Product Detail Page ----
function ProductDetailPage({ products, productsLoading, onAddToCart }) {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    document.title = product
      ? `${product.name} — Voltix Tech`
      : 'Producto no encontrado — Voltix Tech';
    return () => {
      document.title = 'Voltix Tech — Tecnología Premium al Mejor Precio';
    };
  }, [product]);

  if (!product) {
    return productsLoading ? <ProductDetailSkeleton /> : <ProductNotFound />;
  }

  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label || product.category;
  const badgeClass =
    product.badge === 'Oferta' ? 'badge-orange' : product.badge === 'Nuevo' ? 'badge-green' : '';
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const outOfStock = product.stock <= 0;

  const relatedProducts = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 3);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) onAddToCart(product);
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section className="product-detail-section">
      <div className="container">
        <Link to="/" className="back-link" id="back-to-catalog">
          <IconChevronLeft /> Volver al catálogo
        </Link>

        <div className="product-detail" key={product.id}>
          <ProductGallery images={images} name={product.name} />

          <div className="product-detail-info">
            <span className="product-card-category">{categoryLabel}</span>
            <h1 className="product-detail-name">{product.name}</h1>

            {outOfStock ? (
              <span className="product-badge product-badge-static badge-gray">Agotado</span>
            ) : (
              product.badge && (
                <span className={`product-badge product-badge-static ${badgeClass}`}>{product.badge}</span>
              )
            )}

            <p className="product-detail-desc">{product.longDescription || product.description}</p>

            <div className="product-features">
              {product.features.map((f) => (
                <span key={f} className="product-feature-tag">{f}</span>
              ))}
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <ul className="product-highlights">
                {product.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}

            <div className="product-detail-purchase">
              <div className="product-price-group">
                <span className="product-price">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="product-price-original">{formatPrice(product.originalPrice)}</span>
                )}
              </div>

              {!outOfStock && (
                <div className="qty-selector">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    id="detail-qty-minus"
                    aria-label="Reducir cantidad"
                  >
                    <IconMinus />
                  </button>
                  <span className="cart-item-qty">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                    id="detail-qty-plus"
                    aria-label="Aumentar cantidad"
                  >
                    <IconPlus />
                  </button>
                </div>
              )}

              <button
                className={`add-to-cart-btn btn-lg ${added ? 'added' : ''}`}
                onClick={handleAdd}
                disabled={outOfStock}
                id={`detail-add-cart-${product.id}`}
              >
                {outOfStock ? (
                  'Agotado'
                ) : added ? (
                  <>
                    <IconCheck /> Agregado al carrito
                  </>
                ) : (
                  <>
                    <IconPlus /> Agregar al carrito
                  </>
                )}
              </button>
            </div>

            {product.specs && product.specs.length > 0 && (
              <div className="product-specs">
                <h2>Especificaciones</h2>
                <dl className="specs-list">
                  {product.specs.map((s) => (
                    <div className="specs-row" key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2 className="related-products-title">También te puede interesar</h2>
            <div className="products-grid">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ---- Cart Item ----
function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="cart-item-info">
        <div className="cart-item-name">{item.shortName}</div>
        <div className="cart-item-price">{formatPrice(item.price * item.quantity)}</div>
        <div className="cart-item-controls">
          <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)} id={`qty-minus-${item.id}`} aria-label="Reducir cantidad">
            <IconMinus />
          </button>
          <span className="cart-item-qty">{item.quantity}</span>
          <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)} id={`qty-plus-${item.id}`} aria-label="Aumentar cantidad">
            <IconPlus />
          </button>
          <button className="cart-item-remove" onClick={() => onRemove(item.id)} id={`remove-${item.id}`} aria-label={`Quitar ${item.shortName} del carrito`}>
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Cart Drawer ----
function CartDrawer({ open, cart, subtotal, onClose, onUpdateQty, onRemove, onCheckout }) {
  const drawerRef = useModalA11y(open, onClose);

  return (
    <>
      <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${open ? 'open' : ''}`} id="cart-drawer" ref={drawerRef} tabIndex={-1}>
        <div className="cart-header">
          <h2>🛒 Tu Carrito</h2>
          <button className="cart-close-btn" onClick={onClose} id="cart-close-btn" aria-label="Cerrar carrito">
            <IconX />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Tu carrito está vacío</p>
              <p style={{ fontSize: '0.82rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                Agrega productos para comenzar
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem key={item.id} item={item} onUpdateQty={onUpdateQty} onRemove={onRemove} />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-total-row">
                <span>Envío</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Calculado al pagar</span>
              </div>
              <div className="cart-total-row total">
                <span>Total estimado</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <button className="btn btn-whatsapp" onClick={onCheckout} id="checkout-btn">
              <IconWhatsApp />
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ---- Checkout Modal ----
function CheckoutModal({ open, cart, subtotal, token, onClose, onOrderComplete }) {
  const [shippingType, setShippingType] = useState('local');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(LOCAL_CITIES[0]);
  const [carrier, setCarrier] = useState(NATIONAL_CARRIERS[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const modalRef = useModalA11y(open, onClose);

  const shippingCost = shippingType === 'local' ? SHIPPING_COSTS.local : SHIPPING_COSTS.national;
  const total = subtotal + shippingCost;

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Ingresa tu nombre';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Ingresa tu nombre completo';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Ingresa tu teléfono';
    } else if (phoneDigits.length < 7 || phoneDigits.length > 10) {
      newErrors.phone = 'Ingresa un teléfono válido (7 a 10 dígitos)';
    }

    if (!email.trim()) {
      newErrors.email = 'Ingresa tu correo electrónico';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!address.trim()) {
      newErrors.address = 'Ingresa tu dirección';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Ingresa una dirección más detallada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          shippingType,
          shippingCity: shippingType === 'local' ? city : null,
          shippingCarrier: shippingType === 'national' ? carrier : null,
          shippingAddress: address,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === 'insufficient_stock') {
          const item = cart.find((i) => i.id === data.productId);
          setSubmitError(`"${item?.shortName || 'Un producto'}" ya no tiene stock suficiente. Actualiza tu carrito.`);
        } else {
          setSubmitError(data.error || 'No pudimos procesar tu pedido. Intenta de nuevo.');
        }
        return;
      }

      const message = buildWhatsAppMessage(
        data,
        { name, phone, notes },
        {
          type: shippingType,
          city: shippingType === 'local' ? city : null,
          carrier: shippingType === 'national' ? carrier : null,
          address,
        }
      );

      window.open(getWhatsAppURL(message), '_blank');
      onOrderComplete?.();
      onClose();
    } catch {
      setSubmitError('No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="checkout-modal" ref={modalRef} tabIndex={-1}>
        <div className="modal-header">
          <h2>📋 Datos de Envío</h2>
          <button className="cart-close-btn" onClick={onClose} id="modal-close-btn" aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Info */}
            <div className="form-group">
              <label className="form-label" htmlFor="customer-name">Nombre completo *</label>
              <input
                id="customer-name"
                className="form-input"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer-phone">Teléfono / WhatsApp *</label>
              <input
                id="customer-phone"
                className="form-input"
                type="tel"
                placeholder="300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer-email">Correo electrónico *</label>
              <input
                id="customer-email"
                className="form-input"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Shipping Type */}
            <div className="form-group">
              <label className="form-label">Tipo de envío</label>
              <div className="shipping-type-group">
                <button
                  type="button"
                  className={`shipping-type-btn ${shippingType === 'local' ? 'active' : ''}`}
                  onClick={() => setShippingType('local')}
                  id="shipping-local-btn"
                >
                  <span className="icon">🏠</span>
                  Local Valle<br />
                  <small style={{ color: 'var(--text-muted)' }}>{formatPrice(SHIPPING_COSTS.local)}</small>
                </button>
                <button
                  type="button"
                  className={`shipping-type-btn ${shippingType === 'national' ? 'active' : ''}`}
                  onClick={() => setShippingType('national')}
                  id="shipping-national-btn"
                >
                  <span className="icon">🚚</span>
                  Nacional<br />
                  <small style={{ color: 'var(--text-muted)' }}>{formatPrice(SHIPPING_COSTS.national)}</small>
                </button>
              </div>
            </div>

            {/* Dynamic shipping fields */}
            {shippingType === 'local' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="shipping-city">Ciudad *</label>
                <select
                  id="shipping-city"
                  className="form-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {LOCAL_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="shipping-carrier">Transportadora *</label>
                <select
                  id="shipping-carrier"
                  className="form-select"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                >
                  {NATIONAL_CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="shipping-address">Dirección de entrega *</label>
              <input
                id="shipping-address"
                className="form-input"
                type="text"
                placeholder="Calle, Barrio, # Casa/Apto"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <div className="shipping-type-group">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`shipping-type-btn ${paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                    id={`payment-${method.id}-btn`}
                  >
                    <span className="icon">{method.icon}</span>
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="order-notes">Notas adicionales</label>
              <input
                id="order-notes"
                className="form-input"
                type="text"
                placeholder="Color preferido, instrucciones, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Order Summary */}
            <div style={{
              padding: 'var(--space-md)',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
            }}>
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-total-row">
                <span>Envío ({shippingType === 'local' ? 'Local' : 'Nacional'})</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="cart-total-row total">
                <span>Total a pagar</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="cart-total-row">
                <span>Método de pago</span>
                <span>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            {submitError && <div className="form-error submit-error">{submitError}</div>}
            <button className="btn btn-whatsapp" type="submit" id="send-whatsapp-btn" disabled={submitting}>
              <IconWhatsApp />
              {submitting ? 'Enviando pedido...' : 'Enviar Pedido por WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Features Section ----
function Features() {
  const features = [
    { icon: '🚀', title: 'Envío Rápido', desc: 'Entregamos en 24-72h en el Valle del Cauca y a todo el país vía Envía e Interrapidísimo.' },
    { icon: '✅', title: 'Calidad Garantizada', desc: 'Todos nuestros productos pasan por control de calidad. Garantía directa contra defectos.' },
    { icon: '💬', title: 'Atención Directa', desc: 'Gestiona tu pedido directamente por WhatsApp con respuesta inmediata y seguimiento.' },
    { icon: '💰', title: 'Mejores Precios', desc: 'Importación directa sin intermediarios. Los precios más competitivos del mercado.' },
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-label">¿Por qué elegirnos?</div>
          <h2 className="section-title">Beneficios Exclusivos</h2>
          <p className="section-desc">
            Comprar en Voltix Tech es una experiencia diferente. Sin complicaciones, directo y con la mejor calidad.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" id={`feature-${i}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={voltixLogo} alt="Voltix Tech" className="navbar-logo" />
            <span className="footer-brand-name">Voltix Tech</span>
          </div>
          <p className="footer-text">
            © {new Date().getFullYear()} Voltix Tech. Todos los derechos reservados.
          </p>
          <div className="footer-links">
            <Link to="/#hero" className="footer-link">Inicio</Link>
            <Link to="/#catalog" className="footer-link">Catálogo</Link>
            <Link to="/#features" className="footer-link">Beneficios</Link>
            <Link to="/admin/login" className="footer-link" id="footer-admin-link">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---- Home Page ----
function HomePage({ products, productsLoading, productsError, onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('todos');

  const filteredProducts =
    activeCategory === 'todos'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Hero onCatalogClick={scrollToCatalog} />

      {/* ---- Catalog Section ---- */}
      <section className="products-section" id="catalog">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Catálogo</div>
            <h2 className="section-title">Nuestros Productos</h2>
            <p className="section-desc">
              Selección premium de tecnología importada directamente para ti. Elige, agrega al carrito y pide por WhatsApp.
            </p>
          </div>

          <div className="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                id={`filter-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {productsError ? (
            <p className="catalog-status catalog-status-error">{productsError}</p>
          ) : productsLoading ? (
            <p className="catalog-status">Cargando catálogo...</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Features />
    </>
  );
}

// ============================
// Main App Component
// ============================
const CART_STORAGE_KEY = 'voltix_cart';

function loadStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const { user, token, logout } = useAuth();

  const { products, loading: productsLoading, error: productsError, reload: reloadProducts } = useProducts();

  const [cart, setCart] = useState(loadStoredCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimerRef = useRef(null);

  // Cart helpers
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastShow(false), 2200);
  }, []);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.shortName} agregado al carrito`);
  }, [showToast]);

  const updateQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleCheckout = () => {
    setCartOpen(false);
    // Gate de autenticación deshabilitado temporalmente:
    // if (!isAuthenticated) {
    //   navigate('/login', { state: { from: 'checkout' } });
    //   return;
    // }
    setTimeout(() => setCheckoutOpen(true), 300);
  };

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Persistir el carrito para que no se pierda al recargar la página
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Reconciliar el carrito restaurado de localStorage contra el catálogo real:
  // precios/stock pueden haber cambiado, o el producto pudo eliminarse, desde
  // la última visita.
  useEffect(() => {
    if (productsLoading || productsError) return;

    setCart((prevCart) => {
      if (prevCart.length === 0) return prevCart;

      const removed = [];
      const adjusted = [];
      const next = [];

      for (const item of prevCart) {
        const live = products.find((p) => p.id === item.id);
        if (!live || live.stock <= 0) {
          removed.push(item.shortName || item.name);
          continue;
        }
        const clampedQty = Math.min(item.quantity, live.stock);
        if (clampedQty !== item.quantity) adjusted.push(item.shortName || item.name);
        next.push({ ...live, quantity: clampedQty });
      }

      if (removed.length > 0) {
        const isPlural = removed.length > 1;
        showToast(
          `${removed.join(', ')} ya no ${isPlural ? 'están disponibles' : 'está disponible'} y se ${isPlural ? 'quitaron' : 'quitó'} del carrito.`
        );
      } else if (adjusted.length > 0) {
        showToast(`Se ajustó la cantidad de ${adjusted.join(', ')} por disponibilidad de stock.`);
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, productsLoading, productsError]);

  // Reabrir el checkout automáticamente tras iniciar sesión/registrarse (deshabilitado junto al gate)
  // useEffect(() => {
  //   if (location.state?.openCheckout) {
  //     setTimeout(() => setCheckoutOpen(true), 300);
  //     navigate(location.pathname, { replace: true, state: {} });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.state]);

  const isAdminRoute = useLocation().pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && (
        <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} user={user} onLogout={logout} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
              onAddToCart={addToCart}
            />
          }
        />
        <Route
          path="/producto/:id"
          element={
            <ProductDetailPage
              products={products}
              productsLoading={productsLoading}
              onAddToCart={addToCart}
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route
          path="/mis-pedidos"
          element={user ? <OrderHistoryPage /> : <Navigate to="/login" state={{ from: 'pedidos' }} replace />}
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="admin-loading">Cargando panel...</div>}>
              <AdminApp onProductsChanged={reloadProducts} />
            </Suspense>
          }
        />
        <Route path="*" element={<ProductNotFound />} />
      </Routes>

      {!isAdminRoute && (
        <>
          <Footer />

          {/* Drawers & Modals */}
          <CartDrawer
            open={cartOpen}
            cart={cart}
            subtotal={subtotal}
            onClose={() => setCartOpen(false)}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />

          <CheckoutModal
            open={checkoutOpen}
            cart={cart}
            subtotal={subtotal}
            token={token}
            onClose={() => setCheckoutOpen(false)}
            onOrderComplete={() => setCart([])}
          />

          <Toast message={toastMsg} show={toastShow} />
        </>
      )}
    </>
  );
}
