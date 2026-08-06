/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — ADMINISTRATIVE PORTAL SHELL LAYOUT
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Description:
 * This layout component handles rendering the administrative portal shell, 
 * including:
 * 1. The persistent luxury left navigation sidebar.
 * 2. Mobile navigation toggle overlay.
 * 3. The top workspace header bar with notifications, avatars, and date ranges.
 * 4. Gated sub-routing protection.
 * 
 * TABLE OF CONTENTS:
 * 1. IMPORTS & COMPONENT ICONS
 * 2. LAYOUT ROUTE CONTROLLER & SIDEBAR SCHEMAS:
 *    - Gating controls (Navigate redirects standard admin from super-admin routes)
 *    - Path to page titles translator
 *    - Sidebar links schemas (adminLinks vs superAdminLinks)
 * 3. SIDEBAR AND MAIN WORKSPACE RENDERING
 */

import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import './admin.css';

// ─── 1. IMPORTS & COMPONENT ICONS ───────────────────────────────────────────
const SidebarIcon = ({ name }) => {
  const icons = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
    products: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
    categories: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/></svg>,
    customers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
    coupons: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 100 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 100-4V7a2 2 0 00-2-2H5z"/></svg>,
    reviews: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z"/></svg>,
    returns: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16"/></svg>,
    reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"/></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    analytics: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 18V6l-4 4-4-4v12"/></svg>,
    sales: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 11v-1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M5 12h14"/></svg>,
    catalog: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
    stores: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>,
    marketing: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M11 5.882a4.42 4.42 0 003.417-4.238V2.5a.5.5 0 01.5-.5H18m-7 3.882H7.583a1.76 1.76 0 00-1.75 1.583l-.333 3m12.499-2.583a5.53 5.53 0 01.001 7.238l1.094 1.458a.5.5 0 00.8-.6l-1.095-1.458"/></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
    close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  };
  return icons[name] || null;
};

// ─── 2. LAYOUT ROUTE CONTROLLER & SIDEBAR SCHEMAS ────────────────────────────
const AdminLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const isSuper = user?.role === 'superadmin';
  const isSuperRoute = location.pathname === '/admin/users' || location.pathname === '/admin/coupons';

  // Redirect standard admins attempting direct URL access to restricted sections
  if (isSuperRoute && !isSuper) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Translate paths to breadcrumb labels
  const getPageTitle = () => {
    if (location.pathname === '/admin/dashboard') return isSuper ? 'Super Admin Dashboard' : 'Admin Dashboard';
    if (location.pathname === '/admin/products') return 'Products';
    if (location.pathname === '/admin/categories') return 'Categories';
    if (location.pathname === '/admin/orders') return 'Orders';
    if (location.pathname === '/admin/users') return 'Users';
    if (location.pathname === '/admin/coupons') return 'Coupons';
    if (location.pathname === '/admin/featured') return 'Featured Products';
    return 'Admin';
  };

  const pageTitle = getPageTitle();

  // Sidebar link structures as shown in standard admin mockup
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/orders', label: 'Orders', icon: 'orders' },
    { to: '/admin/products', label: 'Products', icon: 'products' },
    { to: '/admin/featured', label: 'Featured Products', icon: 'products' },
    { to: '/admin/categories', label: 'Categories', icon: 'categories' },
    { to: '/admin/users', label: 'Customers', icon: 'customers' },
    { to: '/admin/coupons', label: 'Coupons', icon: 'coupons' },
    { to: '#reviews', label: 'Reviews', icon: 'reviews', mock: true },
    { to: '#returns', label: 'Returns', icon: 'returns', mock: true },
    { to: '#reports', label: 'Reports', icon: 'reports', mock: true },
    { to: '#settings', label: 'Settings', icon: 'settings', mock: true },
  ];

  // Sidebar link structures as shown in super admin mockup
  const superAdminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '#analytics', label: 'Analytics', icon: 'analytics', mock: true },
    { to: '/admin/orders', label: 'Sales', icon: 'sales', arrow: true },
    { to: '/admin/products', label: 'Catalog', icon: 'catalog', arrow: true },
    { to: '/admin/featured', label: 'Featured Products', icon: 'products' },
    { to: '/admin/users', label: 'Customers', icon: 'customers', arrow: true },
    { to: '/admin/coupons', label: 'Marketing', icon: 'marketing', arrow: true },
    { to: '#stores', label: 'Stores', icon: 'stores', mock: true },
    { to: '/admin/users', label: 'Users', icon: 'users' },
    { to: '/admin/coupons', label: 'Coupons', icon: 'coupons' },
    { to: '#reports', label: 'Reports', icon: 'reports', mock: true },
    { to: '#settings', label: 'Settings', icon: 'settings', mock: true },
  ];

  const currentLinks = isSuper ? superAdminLinks : adminLinks;

  // ─── 3. SIDEBAR AND MAIN WORKSPACE RENDERING ───────────────────────────────
  return (
    <div className="admin-root">
      {/* Mobile drawer blur overlay */}
      <div className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Persistent Left Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Branding — ELESENE Logo */}
        <div className="admin-sidebar-brand" style={{ textAlign: 'center', padding: '24px 16px 16px' }}>
          <img
            src="/elesene-logo.png"
            alt="ELESENE"
            className="admin-sidebar-logo"
          />
          <div className={`admin-top-badge-capsule ${isSuper ? 'admin-top-badge-super' : ''}`}>
            {isSuper ? 'SUPER ADMIN' : 'ADMIN PANEL'}
          </div>
        </div>


        {/* Sidebar Nav Links */}
        <nav className="admin-sidebar-nav" style={{ padding: '8px 12px 24px' }}>
          {currentLinks.map((item, idx) => {
            if (item.mock) {
              return (
                <a 
                  key={idx} 
                  href="#" 
                  onClick={e => e.preventDefault()} 
                  className="admin-nav-link"
                >
                  <SidebarIcon name={item.icon} /> {item.label}
                </a>
              );
            }
            return (
              <NavLink 
                key={item.to + idx} 
                to={item.to} 
                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} 
                onClick={() => setSidebarOpen(false)}
              >
                <SidebarIcon name={item.icon} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.arrow && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>▼</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer profiles & Logout */}
        <div className="admin-sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px' }}>
          <div className="admin-sidebar-user" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" 
              alt="Avatar" 
              className="admin-avatar-img"
              loading="lazy"
              decoding="async"
            />
            <div className="admin-sidebar-user-info" style={{ overflow: 'hidden' }}>
              <p className="name" style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                {isSuper ? 'Super Admin' : 'Admin User'}
              </p>
              <p className="role" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', margin: 0, textTransform: 'lowercase' }}>
                {isSuper ? 'superadmin@elegance.com' : 'admin@elegance.com'}
              </p>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout} style={{ marginTop: 12 }}>
            <SidebarIcon name="logout" /> {isSuper ? 'Logout' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="admin-main">
        {/* Workspace Top Header Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <SidebarIcon name={sidebarOpen ? 'close' : 'menu'} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0 }}>{pageTitle}</h1>
                {isSuper && location.pathname === '/admin/dashboard' && (
                  <span style={{ fontSize: '1.15rem' }}>👑</span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                {isSuper ? 'Overview of the entire Elegance platform' : 'Manage your store and track performance'}
              </p>
            </div>
          </div>

          {/* Date range picker, CTA buttons and notification badges */}
          <div className="admin-topbar-actions">
            {/* Date Display Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: '1px solid var(--admin-border)',
              padding: '6px 14px',
              borderRadius: 'var(--admin-radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--admin-text)',
              fontWeight: 500
            }}>
              <span>{isSuper ? '18 Jul 2026 - 18 Jul 2026' : '18 Jul 2026'}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>

            {/* CTA action button */}
            {isSuper ? (
              <button className="admin-btn admin-btn-primary" style={{ height: '34px', padding: '0 16px', fontSize: '0.78rem' }}>
                Export Report
              </button>
            ) : (
              <button 
                className="admin-btn admin-btn-primary" 
                onClick={() => navigate('/admin/products')} 
                style={{ height: '34px', padding: '0 16px', fontSize: '0.78rem' }}
              >
                + Add Product
              </button>
            )}

            {/* Notification alert widget */}
            <div style={{ position: 'relative', cursor: 'pointer', padding: 6 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 700,
                width: 14,
                height: 14,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifycontent: 'center'
              }}>
                {isSuper ? '1' : '2'}
              </span>
            </div>

            {/* User Profile Avatar */}
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" 
              alt="Profile" 
              className="admin-avatar-img-lg"
              style={{ border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              loading="lazy"
              decoding="async"
            />
          </div>
        </header>

        {/* Content Outlet */}
        <div className="admin-content" style={{ background: 'var(--admin-bg)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
