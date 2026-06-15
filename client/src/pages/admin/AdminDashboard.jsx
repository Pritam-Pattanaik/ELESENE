import { useDashboard } from '../../api/admin';

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const StatCard = ({ label, value, icon, color }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ background: `${color}18` }}>
      <span style={{ color, fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
  </div>
);

const statusBadge = (status) => {
  const map = { pending: 'orange', confirmed: 'blue', shipped: 'purple', delivered: 'green', cancelled: 'red', paid: 'green', processing: 'blue' };
  return <span className={`admin-badge admin-badge-${map[status] || 'gray'}`}>{status}</span>;
};

const AdminDashboard = () => {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <div className="admin-loading"><span className="admin-spinner" /> Loading dashboard...</div>;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  const d = data?.dashboard || {};

  return (
    <div>
      <div className="admin-stats">
        <StatCard label="Total Revenue" value={formatCurrency(d.totalRevenue)} icon="₹" color="#22c55e" />
        <StatCard label="Total Orders" value={d.totalOrders || 0} icon="📦" color="#3b82f6" />
        <StatCard label="Customers" value={d.totalCustomers || 0} icon="👥" color="#a855f7" />
        <StatCard label="Active Products" value={d.activeProducts || 0} icon="🏷" color="#C9A84C" />
        <StatCard label="Pending Orders" value={d.pendingOrders || 0} icon="⏳" color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card-header">
            <h3>Recent Orders</h3>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(!d.recentOrders || d.recentOrders.length === 0) ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No orders yet</td></tr>
                ) : d.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="primary-cell">{order.order_number}</td>
                    <td>{order.User?.full_name || order.User?.email || '—'}</td>
                    <td className="primary-cell">{formatCurrency(order.total_amount)}</td>
                    <td>{statusBadge(order.status)}</td>
                    <td>{statusBadge(order.payment_status)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Top Products</h3></div>
          <div className="admin-card-body">
            {(!d.topProducts || d.topProducts.length === 0) ? (
              <div className="admin-empty"><p>No sales data yet</p></div>
            ) : d.topProducts.map((tp, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', width: 20 }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{tp.Product?.name || 'Unknown'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-gold)' }}>{tp.total_sold} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Monthly Revenue</h3></div>
          <div className="admin-card-body">
            {(!d.monthlyRevenue || d.monthlyRevenue.length === 0) ? (
              <div className="admin-empty"><p>No revenue data yet</p></div>
            ) : d.monthlyRevenue.map((mr, i) => {
              const month = new Date(mr.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
              const maxRev = Math.max(...d.monthlyRevenue.map(m => parseFloat(m.revenue) || 0), 1);
              const pct = ((parseFloat(mr.revenue) || 0) / maxRev) * 100;
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>{month}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(mr.revenue)}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--admin-border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--admin-gold)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
