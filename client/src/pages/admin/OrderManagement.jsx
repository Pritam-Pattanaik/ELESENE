import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '../../api/admin';
import { updateOrderTracking } from '../../api/admin';
import { useQueryClient } from '@tanstack/react-query';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { formatCurrency } from '../../utils/currency';

const statusColors = { pending: 'orange', confirmed: 'blue', processing: 'blue', shipped: 'purple', delivered: 'green', cancelled: 'red', returned: 'red' };
const paymentColors = { pending: 'orange', paid: 'green', failed: 'red', refunded: 'purple' };
const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

const OrderDetail = ({ order, onClose }) => {
  const statusMut = useUpdateOrderStatus();
  const qc = useQueryClient();
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [saving, setSaving] = useState(false);

  const handleStatus = async (status) => {
    try { await statusMut.mutateAsync({ id: order.id, status }); } catch (err) { alert(err.message); }
  };

  const handleTracking = async () => {
    setSaving(true);
    try { await updateOrderTracking({ id: order.id, tracking_number: tracking }); qc.invalidateQueries({ queryKey: ['admin-orders'] }); }
    catch (err) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Order {order.order_number}</h3>
          <button className="admin-btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-detail-grid" style={{ marginBottom: 20 }}>
            <div className="admin-detail-item"><label>Customer</label><span>{order.User?.full_name || '—'}</span></div>
            <div className="admin-detail-item"><label>Email</label><span>{order.User?.email || '—'}</span></div>
            <div className="admin-detail-item"><label>Subtotal</label><span>{formatCurrency(order.subtotal, { context: 'Admin Order Subtotal' })}</span></div>
            <div className="admin-detail-item"><label>Shipping</label><span>{formatCurrency(order.shipping_amount ?? order.shippingAmount, { context: 'Admin Order Shipping' })}</span></div>
            <div className="admin-detail-item"><label>Tax</label><span>{formatCurrency(order.tax_amount ?? order.taxAmount, { context: 'Admin Order Tax' })}</span></div>
            <div className="admin-detail-item"><label>Total</label><span style={{ fontWeight: 700, color: 'var(--admin-gold)' }}>{formatCurrency(order.total_amount ?? order.totalAmount ?? order.grandTotal, { context: 'Admin Order Total' })}</span></div>
            <div className="admin-detail-item"><label>Payment</label><span className={`admin-badge admin-badge-${paymentColors[order.payment_status] || 'gray'}`}>{order.payment_status}</span></div>
            <div className="admin-detail-item"><label>Date</label><span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span></div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <label className="admin-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Status:</label>
            <select className="admin-status-select" value={order.status} onChange={e => handleStatus(e.target.value)}>
              {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 20 }}>
            <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="admin-label">Tracking Number</label>
              <input className="admin-input" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Enter tracking #" />
            </div>
            <button className="admin-btn admin-btn-secondary" onClick={handleTracking} disabled={saving}>{saving ? '...' : 'Save'}</button>
          </div>

          <h4 style={{ fontSize: '0.85rem', marginBottom: 10 }}>Order Items</h4>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {order.OrderItems?.map(item => (
                  <tr key={item.id}>
                    <td className="primary-cell">{item.Product?.name || item.product_snapshot?.name || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price ?? item.price, { context: 'Admin Item Unit Price' })}</td>
                    <td className="primary-cell">{formatCurrency(item.total_price ?? item.totalPrice, { context: 'Admin Item Total Price' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading, error } = useAdminOrders({ page, limit: 15, search: search || undefined, status: statusFilter || undefined });

  if (isLoading) return <AdminTableSkeleton rows={8} cols={6} />;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search by order #..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="admin-filters">
          <select className="admin-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {data?.orders?.length === 0 ? (
                <tr><td colSpan="8"><div className="admin-empty"><p>No orders found</p></div></td></tr>
              ) : data?.orders?.map(o => (
                <tr key={o.id}>
                  <td className="primary-cell">{o.order_number}</td>
                  <td>{o.User?.full_name || o.User?.email || '—'}</td>
                  <td>{o.OrderItems?.length || 0}</td>
                  <td className="primary-cell">{formatCurrency(o.total_amount ?? o.totalAmount ?? o.grandTotal, { context: 'Admin Table Order Total' })}</td>
                  <td><span className={`admin-badge admin-badge-${statusColors[o.status] || 'gray'}`}>{o.status}</span></td>
                  <td><span className={`admin-badge admin-badge-${paymentColors[o.payment_status] || 'gray'}`}>{o.payment_status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setSelectedOrder(o)}>View</button>
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

      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default OrderManagement;
