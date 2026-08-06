import { useState, useRef, useEffect } from 'react';
import { useAdminProducts, useAdminCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, createVariant, updateVariant } from '../../api/admin';
import { uploadProductImages, deleteProductImage } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';
import { getImageUrl } from '../../utils/imageUrl';
import { supabase } from '../../supabase';
import { useProductRealtime } from '../../hooks/useProductRealtime';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';

// ─── File validation constants ───────────────────────────────────────────────
const ALLOWED_TYPES = ['image/webp', 'image/jpeg', 'image/png'];
const ALLOWED_EXT   = /\.(webp|jpg|jpeg|png)$/i;
const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

function validateImageFiles(files) {
  const errors = [];
  files.forEach((f) => {
    if (!ALLOWED_TYPES.includes(f.type) || !ALLOWED_EXT.test(f.name)) {
      errors.push(`"${f.name}" is not a supported type (webp, jpg, png only).`);
    } else if (f.size > MAX_BYTES) {
      errors.push(`"${f.name}" exceeds the 5 MB limit.`);
    }
  });
  return errors;
}

// ─── Upload files directly to Supabase bucket ────────────────────────────────
async function uploadToSupabase(productId, files) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');
  if (!isConfigured) return { urls: [], paths: [] };

  const urls   = [];
  const paths  = [];

  for (const file of files) {
    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `${productId}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    if (data) {
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      urls.push(pub.publicUrl);
      paths.push(path);
    }
  }

  return { urls, paths };
}

// ─── Realtime toast ───────────────────────────────────────────────────────────
const LABEL = {
  INSERT: '📦 A new product was added by another session.',
  UPDATE: '✏️  A product was updated by another session.',
  DELETE: '🗑️  A product was removed by another session.',
};

const RealtimeToast = ({ event }) => {
  if (!event) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: 'var(--admin-surface, #1e1e2e)',
      border: '1px solid var(--admin-border, #2d2d3a)',
      borderLeft: '3px solid #6c63ff',
      color: 'var(--admin-text, #e2e8f0)',
      borderRadius: 8, padding: '10px 16px',
      fontSize: '0.82rem', boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      animation: 'rtFadeIn 0.25s ease',
      maxWidth: 320,
    }}>
      <style>{`@keyframes rtFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      🔴 <strong>Live update</strong>
      <div style={{ marginTop: 4, opacity: 0.85 }}>{LABEL[event.type] || 'Product list changed.'}</div>
    </div>
  );
};

// ─── Product create / edit modal ──────────────────────────────────────────────
const ProductModal = ({ product, categories, onClose, onSave, saving }) => {
  const isEdit = !!product;
  const initialImage = product?.images?.find(img => img.is_primary)?.image_url
    || product?.images?.[0]?.image_url || '';

  const [imageUrlInput,  setImageUrlInput]  = useState(initialImage);
  const [selectedFiles,  setSelectedFiles]  = useState([]);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [fileError,      setFileError]      = useState('');

  const [form, setForm] = useState({
    name:               product?.name               || '',
    slug:               product?.slug               || '',
    description:        product?.description        || '',
    base_price:         product?.base_price         || '',
    sale_price:         product?.sale_price         || '',
    sku:                product?.sku                || '',
    brand:              product?.brand              || 'ELESENE',
    category_id:        product?.category_id        || '',
    material:           product?.material           || '',
    care_instructions:  product?.care_instructions  || '',
    is_active:          product?.is_active  ?? true,
    is_featured:        product?.is_featured ?? false,
    is_trending:        product?.is_trending ?? false,
    meta_title:         product?.meta_title         || '',
    meta_description:   product?.meta_description   || '',
    image_url:          initialImage,
  });

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const autoSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const errs = validateImageFiles(files);
    if (errs.length) {
      setFileError(errs.join(' '));
      setSelectedFiles([]);
      setFilePreviewUrl('');
      return;
    }
    setFileError('');
    setSelectedFiles(files);
    setFilePreviewUrl(URL.createObjectURL(files[0]));
  };

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
              <input
                className="admin-input"
                value={form.name}
                onChange={e => {
                  handleChange('name', e.target.value);
                  if (!isEdit) handleChange('slug', autoSlug(e.target.value));
                }}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Slug *</label>
              <input
                className="admin-input"
                value={form.slug}
                onChange={e => handleChange('slug', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Product Image (URL or Upload — webp / jpg / png, max 5 MB)</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                className="admin-input"
                placeholder="Paste image URL (https://…) or upload a file →"
                value={imageUrlInput}
                onChange={e => {
                  setImageUrlInput(e.target.value);
                  handleChange('image_url', e.target.value);
                }}
              />
              <label
                className="admin-btn admin-btn-secondary"
                style={{ cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                📷 Upload File
                <input
                  type="file"
                  multiple
                  accept=".webp,.jpg,.jpeg,.png,image/webp,image/jpeg,image/png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {fileError && (
              <div style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 6,
                background: 'rgba(239,68,68,0.12)', color: '#f87171',
                fontSize: '0.78rem', border: '1px solid rgba(239,68,68,0.3)',
              }}>
                ⚠️ {fileError}
              </div>
            )}

            {(filePreviewUrl || imageUrlInput) && !fileError && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 50, height: 65, borderRadius: 6, overflow: 'hidden',
                  border: '1px solid var(--admin-border)', flexShrink: 0,
                }}>
                  <img
                    src={filePreviewUrl || getImageUrl(imageUrlInput)}
                    alt="Preview thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
                  {filePreviewUrl
                    ? `${selectedFiles.length} file(s) will upload to Supabase on save`
                    : 'Direct image URL linked'}
                </span>
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea
              className="admin-textarea"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Base Price (₹) *</label>
              <input
                className="admin-input"
                type="number"
                step="0.01"
                value={form.base_price}
                onChange={e => handleChange('base_price', e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sale Price (₹)</label>
              <input
                className="admin-input"
                type="number"
                step="0.01"
                value={form.sale_price}
                onChange={e => handleChange('sale_price', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">SKU *</label>
              <input
                className="admin-input"
                value={form.sku}
                onChange={e => handleChange('sku', e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Brand</label>
              <input
                className="admin-input"
                value={form.brand}
                onChange={e => handleChange('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Category</label>
            <select
              className="admin-select"
              value={form.category_id}
              onChange={e => handleChange('category_id', e.target.value)}
            >
              <option value="">Select Category</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Material</label>
              <input
                className="admin-input"
                value={form.material}
                onChange={e => handleChange('material', e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Care Instructions</label>
              <input
                className="admin-input"
                value={form.care_instructions}
                onChange={e => handleChange('care_instructions', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, margin: '12px 0' }}>
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.is_active}   onChange={e => handleChange('is_active',   e.target.checked)} /> Active
            </label>
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.is_featured} onChange={e => handleChange('is_featured', e.target.checked)} /> Featured
            </label>
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.is_trending} onChange={e => handleChange('is_trending', e.target.checked)} /> Trending
            </label>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Meta Title</label>
              <input
                className="admin-input"
                value={form.meta_title}
                onChange={e => handleChange('meta_title', e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Meta Description</label>
              <input
                className="admin-input"
                value={form.meta_description}
                onChange={e => handleChange('meta_description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => onSave(form, null, selectedFiles)}
            disabled={saving || !!fileError}
          >
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ProductManagement = () => {
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editProduct,  setEditProduct]  = useState(null);
  const [imageModal,   setImageModal]   = useState(null);
  const [uploading,    setUploading]    = useState(false);

  const queryParams = { page, limit: 15, search: search || undefined, status: statusFilter || undefined };

  const { data, isLoading, error } = useAdminProducts(queryParams);
  const { data: catData }          = useAdminCategories();
  const createMut  = useCreateProduct();
  const updateMut  = useUpdateProduct();
  const deleteMut  = useDeleteProduct();
  const qc         = useQueryClient();

  // ── Realtime subscription ──
  const { realtimeEvent } = useProductRealtime({ queryParams });

  // ── Save handler (create or update) ──
  const handleSave = async (form, variants, selectedFiles) => {
    try {
      let savedProduct;

      if (editProduct) {
        // --- Client-side Supabase upload on edit ---
        if (selectedFiles?.length && editProduct?.id) {
          try {
            const { urls } = await uploadToSupabase(editProduct.id, selectedFiles);
            if (urls.length) {
              // Merge the new URL(s) into the form as the primary image
              form = { ...form, image_url: urls[0], images: urls.map(u => ({ image_url: u })) };
            }
          } catch (uploadErr) {
            // Fall through to server-side upload fallback
            console.warn('Client Supabase upload failed, will use server fallback:', uploadErr.message);
          }
        }
        const result = await updateMut.mutateAsync({ id: editProduct.id, ...form });
        savedProduct = result?.product;
      } else {
        // Create product first (we need the ID for the bucket path)
        const result = await createMut.mutateAsync(form);
        savedProduct = result?.product;

        // --- Client-side Supabase upload on create ---
        if (selectedFiles?.length && savedProduct?.id) {
          try {
            const { urls } = await uploadToSupabase(savedProduct.id, selectedFiles);
            if (urls.length) {
              // Patch the new product with the uploaded image URL(s) via REST
              await updateMut.mutateAsync({
                id: savedProduct.id,
                images: urls.map(u => ({ image_url: u })),
              });
            }
          } catch (uploadErr) {
            // Fall back: server-side multer upload
            console.warn('Client Supabase upload failed, trying server fallback:', uploadErr.message);
            await uploadProductImages(savedProduct.id, selectedFiles);
          }
        }
      }

      // Server-side fallback upload (for image-modal or when Supabase client fails)
      if (!selectedFiles?.length && savedProduct?.id) {
        // Nothing to upload
      }

      // Save variants if provided
      if (variants && savedProduct?.id) {
        for (const v of variants) {
          if (!v.size && !v.color) continue;
          try {
            if (v.id) {
              await updateVariant({ productId: savedProduct.id, variantId: v.id, size: v.size, color: v.color, color_hex: v.color_hex, stock_quantity: Number(v.stock_quantity || 0), additional_price: Number(v.additional_price || 0) });
            } else {
              await createVariant({ productId: savedProduct.id, size: v.size, color: v.color, color_hex: v.color_hex, stock_quantity: Number(v.stock_quantity || 0), additional_price: Number(v.additional_price || 0), sku_variant: (form.sku || savedProduct.sku || 'VAR') + '-' + v.size + '-' + (v.color || '').replace(/\s+/g, '') });
            }
          } catch (ve) {
            console.warn('Variant save error:', ve.message);
          }
        }
      }

      qc.invalidateQueries({ queryKey: ['admin-products'] });
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

  // ── Image modal upload (server-side, uses existing endpoint) ──
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !imageModal) return;
    const errs = validateImageFiles(files);
    if (errs.length) { alert(errs.join('\n')); return; }
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

  if (isLoading) return <AdminTableSkeleton rows={8} cols={6} />;
  if (error)     return <div className="admin-login-error">Error: {error.message}</div>;

  return (
    <div>
      {/* ── Realtime live-update toast ── */}
      <RealtimeToast event={realtimeEvent} />

      <div className="admin-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="admin-filters">
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="trending">Trending</option>
          </select>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => { setEditProduct(null); setShowModal(true); }}
          >
            + Add Product
          </button>
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
                      <div style={{
                        width: 40, height: 52, borderRadius: 4, overflow: 'hidden',
                        background: 'var(--admin-surface-hover)', flexShrink: 0,
                      }}>
                        {p.images?.[0] && (
                          <img
                            src={getImageUrl(p.images[0].image_url)}
                            alt={p.name ? `${p.name} preview` : 'Product thumbnail'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </div>
                      <div>
                        <div className="primary-cell">{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.sku}</td>
                  <td className="primary-cell">
                    ₹{p.base_price}
                    {p.sale_price && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--admin-text-dim)', marginLeft: 6, fontSize: '0.75rem' }}>
                        ₹{p.sale_price}
                      </span>
                    )}
                  </td>
                  <td>{p.Category?.name || '—'}</td>
                  <td>
                    <span className={`admin-badge ${p.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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

      {showModal && (
        <ProductModal
          product={editProduct}
          categories={catData?.categories || []}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
          saving={createMut.isPending || updateMut.isPending}
        />
      )}

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
                    <img
                      src={getImageUrl(img.image_url)}
                      alt={imageModal.name ? `${imageModal.name} image` : 'Product image'}
                      loading="lazy"
                      decoding="async"
                    />
                    <button onClick={() => handleDeleteImage(imageModal.id, img.id)}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : '+ Upload Images'}
                  <input
                    type="file"
                    multiple
                    accept=".webp,.jpg,.jpeg,.png,image/webp,image/jpeg,image/png"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ marginLeft: 10, fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>
                  webp / jpg / png · max 5 MB each
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
