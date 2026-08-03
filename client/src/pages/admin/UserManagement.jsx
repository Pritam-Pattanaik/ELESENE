import { useState } from 'react';
import { useAdminUsers, useUpdateUserRole } from '../../api/admin';
import useAuthStore from '../../store/authStore';

const roleColors = { customer: 'blue', admin: 'gold', superadmin: 'purple' };

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-btn-icon" onClick={onCancel}>✕</button>
        </div>
        <div className="admin-modal-body">
          <p style={{ margin: '8px 0', fontSize: '0.95rem', color: 'var(--admin-text)' }}>{message}</p>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmData, setConfirmData] = useState(null); // { userId, role }
  const { data, isLoading, error } = useAdminUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
  const roleMut = useUpdateUserRole();
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  if (isLoading) return <div className="admin-loading"><span className="admin-spinner" /> Loading users...</div>;
  if (error) return <div className="admin-login-error">Error: {error.message}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="admin-filters">
          <select className="admin-filter-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th>{isSuperAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}</tr></thead>
            <tbody>
              {data?.users?.length === 0 ? (
                <tr><td colSpan={isSuperAdmin ? 6 : 5}><div className="admin-empty"><p>No users found</p></div></td></tr>
              ) : data?.users?.map(u => (
                <tr key={u.id}>
                  <td className="primary-cell">{u.full_name || '—'}</td>
                  <td>{u.email || '—'}</td>
                  <td>{u.phone || '—'}</td>
                  <td><span className={`admin-badge admin-badge-${roleColors[u.role] || 'gray'}`}>{u.role}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  {isSuperAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <select 
                        className="admin-status-select" 
                        value={u.role} 
                        onChange={e => setConfirmData({ userId: u.id, role: e.target.value })} 
                        disabled={u.id === currentUser.id}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                  )}
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

      <ConfirmModal 
        isOpen={!!confirmData}
        title="Change User Role"
        message={`Are you sure you want to change this user's role to ${confirmData?.role === 'superadmin' ? 'Super Admin' : confirmData?.role === 'admin' ? 'Admin' : 'Customer'}?`}
        onConfirm={async () => {
          const { userId, role } = confirmData;
          setConfirmData(null);
          try { 
            await roleMut.mutateAsync({ id: userId, role }); 
          } catch (err) { 
            alert(err.message); 
          }
        }}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
};

export default UserManagement;
