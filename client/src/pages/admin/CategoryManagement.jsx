import { useState } from 'react';
import { useAdminCategories, useCreateCategory, useUpdateCategory } from '../../api/admin';
import { deleteCategory } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

const CategoryModal = ({ category, categories, onClose, onSave, saving }) => {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name || '', slug: category?.slug || '',
    description: category?.description || '', parent_id: category?.parent_id || '',
    image_url: category?.image_url || '', sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true,
  });
  const handleChange = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const autoSlug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isEdit ? 'Edit Category' : 'Add Category'}</h3>
          <button className="admin-btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Name *</label>
              <input className="admin-input" value={form.name} onChange={e => { handleChange('name', e.target.value); if (!isEdit) handleChange('slug', autoSlug(e.target.value)); }} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Slug *</label>
              <input className="admin-input" value={form.slug} onChange={e => handleChange('slug', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea className="admin-textarea" value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Parent Category</label>
              <select className="admin-select" value={form.parent_id} onChange={e => handleChange('parent_id', e.target.value || null)}>
                <option value="">None (Top Level)</option>
                {categories?.filter(c => c.id !== category?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sort Order</label>
              <input className="admin-input" type="number" value={form.sort_order} onChange={e => handleChange('sort_order', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Image URL</label>
            <input className="admin-input" value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} placeholder="https://..." />
          </div>
          <label className="admin-checkbox-label"><input type="checkbox" checked={form.is_active} onChange={e => handleChange('is_active', e.target.checked)} /> Active</label>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={() => onSave(form)} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

const CategoryManagement = () => {
  const { data, isLoading, error } = useAdminCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const handleSave = async (form) => {
    try {
      if (editCat) { await updateMut.mutateAsync({ id: editCat.id, ...form }); }
      else { await createMut.mutateAsync(form); }
      setShowModal(false); setEditCat(null);
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this category?')) return;
    try { await deleteCategory(id); qc.invalidateQueries({ queryKey: ['admin-categories'] }); }
    catch (err) { alert(err.message); }
  };

  if (isLoading) return <div className="admin-loading"><span className="admin-spinner" /> Loading...</div>;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  const cats = data?.categories || [];
  const parentCats = cats.filter(c => !c.parent_id);
  const getChildren = (parentId) => cats.filter(c => c.parent_id === parentId);

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{cats.length} categories</h3>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditCat(null); setShowModal(true); }}>+ Add Category</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Status</th><th>Order</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {cats.length === 0 ? (
                <tr><td colSpan="6"><div className="admin-empty"><p>No categories</p></div></td></tr>
              ) : parentCats.map(cat => (
                <>
                  <tr key={cat.id}>
                    <td className="primary-cell" style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>{cat.slug}</td>
                    <td>{cat.productCount}</td>
                    <td><span className={`admin-badge ${cat.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>{cat.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>{cat.sort_order}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginRight: 6 }} onClick={() => { setEditCat(cat); setShowModal(true); }}>Edit</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(cat.id)}>Delete</button>
                    </td>
                  </tr>
                  {getChildren(cat.id).map(child => (
                    <tr key={child.id}>
                      <td className="primary-cell" style={{ paddingLeft: 40 }}>↳ {child.name}</td>
                      <td>{child.slug}</td>
                      <td>{child.productCount}</td>
                      <td><span className={`admin-badge ${child.is_active ? 'admin-badge-green' : 'admin-badge-gray'}`}>{child.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>{child.sort_order}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginRight: 6 }} onClick={() => { setEditCat(child); setShowModal(true); }}>Edit</button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(child.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CategoryModal category={editCat} categories={cats} onClose={() => { setShowModal(false); setEditCat(null); }} onSave={handleSave} saving={createMut.isPending || updateMut.isPending} />}
    </div>
  );
};

export default CategoryManagement;
