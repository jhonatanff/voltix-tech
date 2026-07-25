import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from '../../config';
import { adminFetch, adminFetchJSON } from '../../admin/api.js';

export default function TrashPage({ onProductsChanged }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/products/trash');
      if (!res.ok) throw new Error('No se pudo cargar la papelera.');
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

  const handleRestore = async (product) => {
    try {
      await adminFetchJSON(`/api/products/${product.id}/restore`, { method: 'POST' });
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
        <h1>Papelera</h1>
        <span className="admin-page-subtitle">Productos eliminados — no se muestran en la tienda</span>
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
                <th>Eliminado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.image} alt="" className="admin-table-thumb" /></td>
                  <td>{p.name}</td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>{new Date(p.deletedAt).toLocaleDateString('es-CO')}</td>
                  <td className="admin-table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleRestore(p)} id={`restore-product-${p.id}`}>
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="catalog-status">La papelera está vacía.</p>}
        </div>
      )}
    </div>
  );
}
