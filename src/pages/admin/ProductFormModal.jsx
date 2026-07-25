import { useState } from 'react';
import { CATEGORIES } from '../../config';
import { adminFetch, adminFetchJSON } from '../../admin/api.js';
import { useModalA11y } from '../../hooks/useModalA11y';

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.id !== 'todos');

function emptyForm(product) {
  return {
    name: product?.name || '',
    shortName: product?.shortName || '',
    description: product?.description || '',
    longDescription: product?.longDescription || '',
    price: product?.price ?? '',
    originalPrice: product?.originalPrice ?? '',
    category: product?.category || CATEGORY_OPTIONS[0]?.id || '',
    badge: product?.badge || '',
    stock: product?.stock ?? 0,
    image: product?.image || '',
    images: product?.images?.length ? product.images : product?.image ? [product.image] : [],
    features: product?.features?.length ? product.features : [],
    specs: product?.specs?.length ? product.specs : [],
    highlights: product?.highlights?.length ? product.highlights : [],
  };
}

async function uploadImage(file) {
  const res = await adminFetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen.');
  return data.url;
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() => emptyForm(product));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useModalA11y(true, onClose);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image: url, images: f.images.length ? f.images : [url] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryImageAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const updateListItem = (key, index, value) => {
    setForm((f) => ({ ...f, [key]: f[key].map((item, i) => (i === index ? value : item)) }));
  };
  const addListItem = (key, value) => setForm((f) => ({ ...f, [key]: [...f[key], value] }));
  const removeListItem = (key, index) => setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));

  const updateSpec = (index, field, value) => {
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.shortName.trim()) {
      setError('Nombre y nombre corto son obligatorios.');
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError('El precio debe ser un número válido.');
      return;
    }
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      setError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      description: form.description.trim() || null,
      longDescription: form.longDescription.trim() || null,
      price,
      originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
      category: form.category,
      badge: form.badge.trim() || null,
      stock,
      image: form.image || null,
      images: form.images,
      features: form.features.filter((f) => f.trim()),
      specs: form.specs.filter((s) => s.label?.trim() && s.value?.trim()),
      highlights: form.highlights.filter((h) => h.trim()),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await adminFetchJSON(`/api/products/${product.id}`, { method: 'PUT', body: payload });
      } else {
        await adminFetchJSON('/api/products', { method: 'POST', body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal admin-product-modal" id="product-form-modal" ref={modalRef} tabIndex={-1}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button className="cart-close-btn" onClick={onClose} id="product-form-close-btn" type="button" aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body admin-form-body">
            <div className="form-group">
              <label className="form-label" htmlFor="pf-name">Nombre *</label>
              <input id="pf-name" className="form-input" value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pf-short-name">Nombre corto *</label>
              <input id="pf-short-name" className="form-input" value={form.shortName} onChange={(e) => setField('shortName', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pf-description">Descripción corta</label>
              <input id="pf-description" className="form-input" value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pf-long-description">Descripción larga</label>
              <textarea id="pf-long-description" className="form-input admin-textarea" value={form.longDescription} onChange={(e) => setField('longDescription', e.target.value)} />
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="pf-price">Precio *</label>
                <input id="pf-price" className="form-input" type="number" min="0" value={form.price} onChange={(e) => setField('price', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pf-original-price">Precio original</label>
                <input id="pf-original-price" className="form-input" type="number" min="0" value={form.originalPrice} onChange={(e) => setField('originalPrice', e.target.value)} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="pf-category">Categoría *</label>
                <select id="pf-category" className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pf-stock">Stock *</label>
                <input id="pf-stock" className="form-input" type="number" min="0" step="1" value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pf-badge">Badge (opcional)</label>
              <input id="pf-badge" className="form-input" placeholder="Ej: Nuevo, Oferta, Premium" value={form.badge} onChange={(e) => setField('badge', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Imagen principal</label>
              {form.image && <img src={form.image} alt="" className="admin-image-preview" />}
              <input type="file" accept="image/*" onChange={handleMainImageUpload} disabled={uploading} id="pf-image-upload" />
            </div>

            <div className="form-group">
              <label className="form-label">Galería adicional</label>
              <div className="admin-gallery-list">
                {form.images.map((img, i) => (
                  <div className="admin-gallery-item" key={img + i}>
                    <img src={img} alt="" />
                    <button type="button" onClick={() => removeGalleryImage(i)} aria-label="Quitar imagen">×</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" onChange={handleGalleryImageAdd} disabled={uploading} id="pf-gallery-upload" />
            </div>

            <div className="form-group">
              <label className="form-label">Características (tags cortos)</label>
              {form.features.map((f, i) => (
                <div className="admin-list-row" key={i}>
                  <input className="form-input" value={f} onChange={(e) => updateListItem('features', i, e.target.value)} />
                  <button type="button" onClick={() => removeListItem('features', i)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addListItem('features', '')}>+ Agregar</button>
            </div>

            <div className="form-group">
              <label className="form-label">Especificaciones</label>
              {form.specs.map((s, i) => (
                <div className="admin-list-row admin-spec-row" key={i}>
                  <input className="form-input" placeholder="Etiqueta" value={s.label || ''} onChange={(e) => updateSpec(i, 'label', e.target.value)} />
                  <input className="form-input" placeholder="Valor" value={s.value || ''} onChange={(e) => updateSpec(i, 'value', e.target.value)} />
                  <button type="button" onClick={() => removeListItem('specs', i)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addListItem('specs', { label: '', value: '' })}>+ Agregar</button>
            </div>

            <div className="form-group">
              <label className="form-label">Highlights (con emoji, opcional)</label>
              {form.highlights.map((h, i) => (
                <div className="admin-list-row" key={i}>
                  <input className="form-input" value={h} onChange={(e) => updateListItem('highlights', i, e.target.value)} />
                  <button type="button" onClick={() => removeListItem('highlights', i)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addListItem('highlights', '')}>+ Agregar</button>
            </div>

            {error && <div className="form-error">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary" type="submit" id="product-form-save-btn" disabled={saving || uploading}>
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
