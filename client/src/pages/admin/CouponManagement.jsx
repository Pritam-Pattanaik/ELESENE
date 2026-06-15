import { useState } from 'react';
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon } from '../../api/admin';
import { deleteCoupon } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';

const CouponModal = ({ coupon, onClose, onSave, saving }) => {
  const isEdit = !!coupon;
  const [form, setForm] = useState({
    code: coupon?.code || '', type: coupon?.type || 'percentage',
    value: coupon?.value || '', min_order_value: coupon?.min_order_value || '',
    max_discount: coupon?.max_discount || '', usage_limit: coupon?.usage_limit || '',
    per_user_limit: coupon?.per_user_limit || 1,
    valid_from: coupon?.valid_from ? coupon.valid_from.slice(0, 10) : '',
    valid_until: coupon?.valid_until ? coupon.valid_until.slice(0, 10) : '',
    is_active: coupon?.is_active ?? true,
  });
  const h = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <button className="admin-btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Code *</label>
              <input className="admin-input" value={form.code} onChange={e => h('code', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Type</label>
              <select className="admin-select" value={form.type} onChange={e => h('type', e.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Value ({form.type === 'percentage' ? '%' : '₹'}) *</label>
              <input className="admin-input" type="number" step="0.01" value={form.value} onChange={e => h('value', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Min Order Value (₹)</label>
              <input className="admin-input" type="number" step="0.01" value={form.min_order_value} onChange={e => h('min_order_value', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Max Discount (₹)</label>
              <input className="admin-input" type="number" step="0.01" value={form.max_discount} onChange={e => h('max_discount', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Usage Limit</label>
              <input className="admin-input" type="number" value={form.usage_limit} onChange={e => h('usage_limit', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Valid From</label>
              <input className="admin-input" type="date" value={form.valid_from} onChange={e => h('valid_from', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Valid Until</label>
              <input className="admin-input" type="date" value={form.valid_until} onChange={e => h('valid_until', e.target.value)} />
            </div>
          </div>
          <label className="admin-checkbox-label"><input type="checkbox" checked={form.is_active} onChange={e => h('is_active', e.target.checked)} /> Active</label>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={() => onSave(form)} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
};

const CouponManagement = () => {
  const { data, isLoading, error } = useAdminCoupons();
  const createMut = useCreateCoupon();
  const updateMut = useUpdateCoupon();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);

  const handleSave = async (form) => {
    try {
      if (editCoupon) { await updateMut.mutateAsync({ id: editCoupon.id, ...form }); }
      else { await createMut.mutateAsync(form); }
      setShowModal(false); setEditCoupon(null);
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this coupon?')) return;
    try { await deleteCoupon(id); qc.invalidateQueries({ queryKey: ['admin-coupons'] }); }
    catch (err) { alert(err.message); }
  };

  if (isLoading) return <div className="admin-loading"><span className="admin-spinner" /> Loading coupons...</div>;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  const coupons = data?.coupons || [];
  const now = new Date();

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{coupons.length} coupons</h3>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditCoupon(null); setShowModal(true); }}>+ Create Coupon</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Usage</th><th>Valid Until</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan="7"><div className="admin-empty"><p>No coupons</p></div></td></tr>
              ) : coupons.map(c => {
                const expired = c.valid_until && new Date(c.valid_until) < now;
                return (
                  <tr key={c.id}>
                    <td className="primary-cell" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.code}</td>
                    <td><span className={`admin-badge ${c.type === 'percentage' ? 'admin-badge-blue' : 'admin-badge-gold'}`}>{c.type}</span></td>
                    <td className="primary-cell">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td>{c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                    <td>{c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      {!c.is_active ? <span className="admin-badge admin-badge-gray">Inactive</span>
                        : expired ? <span className="admin-badge admin-badge-red">Expired</span>
                        : <span className="admin-badge admin-badge-green">Active</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginRight: 6 }} onClick={() => { setEditCoupon(c); setShowModal(true); }}>Edit</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CouponModal coupon={editCoupon} onClose={() => { setShowModal(false); setEditCoupon(null); }} onSave={handleSave} saving={createMut.isPending || updateMut.isPending} />}
    </div>
  );
};

export default CouponManagement;
