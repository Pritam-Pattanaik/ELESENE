import { useState } from 'react';
import { useAdminProducts, useAdminCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, createVariant, updateVariant } from '../../api/admin';
import { uploadProductImages, deleteProductImage } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';
import { getImageUrl } from '../../utils/imageUrl';

const ProductModal = ({ product, categories, onClose, onSave, saving }) => {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '', slug: product?.slug || '', description: product?.description || '',
    base_price: product?.base_price || '', sale_price: product?.sale_price || '',
    sku: product?.sku || '', brand: product?.brand || 'ELESENE',
    category_id: product?.category_id || '', material: product?.material || '',
    care_instructions: product?.care_instructions || '',
    is_active: product?.is_active ?? true, is_featured: product?.is_featured ?? false,
    is_trending: product?.is_trending ?? false,
    meta_title: product?.meta_title || '', meta_description: product?.meta_description || '',
  });

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button className="admin-btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Product Name *</label>
              <input className="admin-input" value={form.name} onChange={e => { handleChange('name', e.target.value); if (!isEdit) handleChange('slug', autoSlug(e.target.value)); }} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Slug *</label>
              <input className="admin-input" value={form.slug} onChange={e => handleChange('slug', e.target.value)} required />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea className="admin-textarea" value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Base Price (₹) *</label>
              <input className="admin-input" type="number" step="0.01" value={form.base_price} onChange={e => handleChange('base_price', e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sale Price (₹)</label>
              <input className="admin-input" type="number" step="0.01" value={form.sale_price} onChange={e => handleChange('sale_price', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">SKU *</label>
              <input className="admin-input" value={form.sku} onChange={e => handleChange('sku', e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Brand</label>
              <input className="admin-input" value={form.brand} onChange={e => handleChange('brand', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Category</label>
            <select className="admin-select" value={form.category_id} onChange={e => handleChange('category_id', e.target.value)}>
              <option value="">Select Category</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Material</label>
              <input className="admin-input" value={form.material} onChange={e => handleChange('material', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Care Instructions</label>
              <input className="admin-input" value={form.care_instructions} onChange={e => handleChange('care_instructions', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, margin: '12px 0' }}>
            <label className="admin-checkbox-label"><input type="checkbox" checked={form.is_active} onChange={e => handleChange('is_active', e.target.checked)} /> Active</label>
            <label className="admin-checkbox-label"><input type="checkbox" checked={form.is_featured} onChange={e => handleChange('is_featured', e.target.checked)} /> Featured</label>
            <label className="admin-checkbox-label"><input type="checkbox" checked={form.is_trending} onChange={e => handleChange('is_trending', e.target.checked)} /> Trending</label>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Meta Title</label>
              <input className="admin-input" value={form.meta_title} onChange={e => handleChange('meta_title', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Meta Description</label>
              <input className="admin-input" value={form.meta_description} onChange={e => handleChange('meta_description', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, error } = useAdminProducts({ page, limit: 15, search: search || undefined, status: statusFilter || undefined });
  const { data: catData } = useAdminCategories();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const qc = useQueryClient();

  const handleSave = async (form, variants) => {
    try {
      let savedProduct;
      if (editProduct) {
        const result = await updateMut.mutateAsync({ id: editProduct.id, ...form });
        savedProduct = result.product;
      } else {
        const result = await createMut.mutateAsync(form);
        savedProduct = result.product;
      }
      // Save variants if any were provided
      if (variants && savedProduct?.id) {
        for (const v of variants) {
          if (!v.size && !v.color) continue; // skip blank rows
          try {
            if (v.id) {
              await updateVariant({ productId: savedProduct.id, variantId: v.id, size: v.size, color: v.color, color_hex: v.color_hex, stock_quantity: Number(v.stock_quantity || 0), additional_price: Number(v.additional_price || 0) });
            } else {
              await createVariant({ productId: savedProduct.id, size: v.size, color: v.color, color_hex: v.color_hex, stock_quantity: Number(v.stock_quantity || 0), additional_price: Number(v.additional_price || 0), sku_variant: (form.sku || savedProduct.sku || 'VAR') + '-' + v.size + '-' + (v.color || '').replace(/\s+/g, '') });
            }
          } catch (ve) { console.warn('Variant save error:', ve.message); }
        }
        qc.invalidateQueries({ queryKey: ['admin-products'] });
      }
      setShowModal(false);
      setEditProduct(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try { await deleteMut.mutateAsync(id); } catch (err) { alert(err.message); }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !imageModal) return;
    setUploading(true);
    try {
      await uploadProductImages(imageModal.id, files);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setImageModal(null);
    } catch (err) { alert(err.message); }
    setUploading(false);
  };

  const handleDeleteImage = async (productId, imageId) => {
    try {
      await deleteProductImage({ productId, imageId });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (err) { alert(err.message); }
  };

  if (isLoading) return <div className="admin-loading"><span className="admin-spinner" /> Loading products...</div>;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="admin-filters">
          <select className="admin-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="trending">Trending</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>+ Add Product</button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th>Flags</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.length === 0 ? (
                <tr><td colSpan="7"><div className="admin-empty"><p>No products found</p></div></td></tr>
              ) : data?.products?.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 52, borderRadius: 4, overflow: 'hidden', background: 'var(--admin-surface-hover)', flexShrink: 0 }}>
                        {p.images?.[0] && <img src={getImageUrl(p.images[0].image_url)} alt={p.name ? `${p.name} preview` : 'Product thumbnail'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />}
                      </div>
                      <div>
                        <div className="primary-cell">{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.sku}</td>
                  <td className="primary-cell">₹{p.base_price}{p.sale_price && <span style={{ textDecoration: 'line-through', color: 'var(--admin-text-dim)', marginLeft: 6, fontSize: '0.75rem' }}>₹{p.sale_price}</span>}</td>
                  <td>{p.Category?.name || '—'}</td>
                  <td><span className={`admin-badge ${p.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    {p.is_featured && <span className="admin-badge admin-badge-gold" style={{ marginRight: 4 }}>Featured</span>}
                    {p.is_trending && <span className="admin-badge admin-badge-purple">Trending</span>}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginRight: 6 }} onClick={() => setImageModal(p)}>🖼</button>
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginRight: 6 }} onClick={() => { setEditProduct(p); setShowModal(true); }}>Edit</button>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-pagination">
        <span>Page {data?.currentPage} of {data?.totalPages || 1} ({data?.totalCount} total)</span>
        <div className="admin-pagination-btns">
          <button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={page >= (data?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>

      {showModal && <ProductModal product={editProduct} categories={catData?.categories || []} onClose={() => { setShowModal(false); setEditProduct(null); }} onSave={handleSave} saving={createMut.isPending || updateMut.isPending} />}

      {imageModal && (
        <div className="admin-modal-overlay" onClick={() => setImageModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Images — {imageModal.name}</h3>
              <button className="admin-btn-icon" onClick={() => setImageModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-image-grid">
                {imageModal.images?.map(img => (
                  <div key={img.id} className="admin-image-thumb">
                    <img src={getImageUrl(img.image_url)} alt={imageModal.name ? `${imageModal.name} image thumbnail` : 'Product image thumbnail'} loading="lazy" decoding="async" />
                    <button onClick={() => handleDeleteImage(imageModal.id, img.id)}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : '+ Upload Images'}
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
