import { useState, useEffect, useCallback } from 'react';
import { formatPrice, CATEGORIES } from '../../config';
import { adminFetch, adminFetchJSON } from '../../admin/api.js';
import ProductFormModal from './ProductFormModal.jsx';

export default function ProductsPage({ onProductsChanged }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/products');
      if (!res.ok) throw new Error('No se pudo cargar el catálogo.');
      setProducts(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = () => {
    setEditingProduct(null);
    setShowCreateForm(false);
    load();
    onProductsChanged?.();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminFetchJSON(`/api/products/${product.id}`, { method: 'DELETE' });
      load();
      onProductsChanged?.();
    } catch (err) {
      alert(err.message);
    }
  };

  const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Productos</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateForm(true)} id="new-product-btn">
          + Nuevo producto
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p className="catalog-status">Cargando...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Badge</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.stock <= 0 ? 'admin-row-out-of-stock' : ''}>
                  <td><img src={p.image} alt="" className="admin-table-thumb" /></td>
                  <td>{p.name}</td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock <= 0 ? <span className="admin-badge-agotado">Agotado</span> : p.stock}</td>
                  <td>{p.badge || '—'}</td>
                  <td className="admin-table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingProduct(p)} id={`edit-product-${p.id}`}>Editar</button>
                    <button className="admin-delete-btn" onClick={() => handleDelete(p)} id={`delete-product-${p.id}`}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="catalog-status">No hay productos todavía.</p>}
        </div>
      )}

      {(showCreateForm || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setEditingProduct(null); setShowCreateForm(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
