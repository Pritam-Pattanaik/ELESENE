import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import useUiStore from '../../store/uiStore';
import useCartStore from '../../store/cartStore';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import { getNotifications, markAllNotificationsRead } from '../../api/user';

/* ─── Icon helpers ─────────────────────────────────────────────────────────── */
const Icon = ({ d, className = 'w-[18px] h-[18px]' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    {Array.isArray(d)
      ? d.map((path, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={path} />)
      : <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    }
  </svg>
);

const NAV_ITEMS = [
  {
    to: '/account/profile',
    label: 'My Profile',
    segment: 'profile',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  {
    to: '/account/orders',
    label: 'My Orders',
    segment: 'orders',
    icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  },
  {
    to: '/account/wishlist',
    label: 'Wishlist',
    segment: 'wishlist',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  },
  {
    to: '/account/addresses',
    label: 'Saved Addresses',
    segment: 'addresses',
    icon: ['M15 10.5a3 3 0 11-6 0 3 3 0 016 0z', 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z'],
  },
  {
    to: '/account/payments',
    label: 'Payment Methods',
    segment: 'payments',
    icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },
  {
    to: '/account/rewards',
    label: 'Rewards & Club',
    segment: 'rewards',
    badge: 'ELITE',
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  },
  {
    to: '/account/notifications',
    label: 'Notifications',
    segment: 'notifications',
    icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  },
  {
    to: '/account/settings',
    label: 'Account Settings',
    segment: 'settings',
    icon: ['M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z', 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
  },
  {
    to: '/contact',
    label: 'Help & Support',
    segment: null,
    icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
  },
  {
    to: '/',
    label: 'Return to Store',
    segment: null,
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
];

/* ── Shared icon button for navbar ── */
const NavIconBtn = ({ label, onClick, badge, children }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className="relative w-9 h-9 rounded-full bg-white border border-[#ECE8E1] flex items-center justify-center text-[#6F6F6F] hover:border-[#B99246] hover:text-[#B99246] transition-all duration-200 cursor-pointer"
    style={{ boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}
  >
    {children}
    {badge > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#B99246] rounded-full text-[8px] font-bold text-[#0F0F10] flex items-center justify-center border-2 border-[#FAF9F7]">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </button>
);

const AccountLayout = () => {
  const { isAuthenticated, user, logout } = useCustomerAuthStore();
  const { openCart } = useUiStore();
  const { items: cartItems } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated) {
      getNotifications({ limit: 5 })
        .then((data) => {
          if (mounted) {
            setNotifications(data?.notifications || []);
            setUnreadCount(data?.unreadCount ?? 0);
          }
        })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const data = await markAllNotificationsRead();
      setUnreadCount(data?.unreadCount ?? 0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    useWishlistStore.getState().clearWishlist();
    setNotifOpen(false);
    setProfileOpen(false);
    navigate('/');
  };

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;

  const pathSegment = location.pathname.split('/account/')[1]?.replace(/\/$/, '') || 'profile';

  const isActive = (item) => {
    if (item.segment === 'profile') return pathSegment === 'profile' || location.pathname === '/account' || location.pathname === '/account/';
    return item.segment && pathSegment === item.segment;
  };

  /* ── Sidebar Nav Item ── */
  const NavItem = ({ item, onClick }) => {
    const active = isActive(item);
    return (
      <Link
        to={item.to}
        onClick={onClick}
        className={`relative flex items-center justify-between py-2.5 pl-4 pr-3 rounded-xl text-[11px] font-futura tracking-[0.1em] uppercase transition-all duration-200 group ${
          active
            ? 'text-[#B99246] bg-[#B99246]/8'
            : 'text-white/50 hover:text-white/90 hover:bg-white/[0.04]'
        }`}
      >
        {/* Gold left indicator */}
        {active && (
          <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-gradient-to-b from-[#B99246] to-[#D4AF6A] rounded-full" />
        )}
        <div className="flex items-center gap-3">
          <span className={`transition-colors ${active ? 'text-[#B99246]' : 'text-white/40 group-hover:text-white/70'}`}>
            <Icon d={item.icon} />
          </span>
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className="text-[7px] font-futura tracking-widest bg-[#B99246] text-[#0F0F10] px-1.5 py-0.5 rounded-full font-bold uppercase">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };



  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F7] text-[#141414] font-body select-none">
      <CustomCursor />

      {/* ══════════════════════ DESKTOP SIDEBAR ══════════════════════ */}
      <aside
        className="hidden md:flex flex-col justify-between w-64 shrink-0 sticky top-0 h-screen overflow-y-auto bg-[#0F0F10] text-white border-r border-white/[0.06]"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Brand */}
          <Link to="/" className="block group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B99246] rounded-lg p-1 -m-1">
            <span className="text-lg font-display font-bold tracking-[0.22em] text-white uppercase group-hover:text-[#B99246] transition-colors duration-200 block">
              ELESENE
            </span>
            <span className="text-[7px] font-futura tracking-[0.28em] text-[#B99246]/70 uppercase font-semibold block mt-0.5">
              BE YOU. BE ELESENE.
            </span>
          </Link>

          {/* Hairline */}
          <div className="border-t border-white/[0.06]" />

          {/* Nav links */}
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-4">
          {/* ELESENE CLUB promo */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-futura tracking-widest text-white/70 uppercase font-bold">ELESENE CLUB</span>
              <span className="text-[#B99246] text-xs">✦</span>
            </div>
            <p className="text-[9px] text-white/40 leading-relaxed font-futura font-light">
              You're a {user?.investmentTier || 'Seed'} Member. Enjoy exclusive offers and early access.
            </p>
            <Link
              to="/account/rewards"
              className="block w-full py-2 border border-[#B99246]/30 hover:border-[#B99246] hover:bg-[#B99246]/5 text-[#B99246] text-center text-[8px] font-futura tracking-widest uppercase font-bold rounded-xl transition-all duration-200"
            >
              EXPLORE BENEFITS
            </Link>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 pl-4 text-[11px] font-futura tracking-[0.1em] uppercase text-red-500/70 hover:text-red-400 transition-colors duration-200 w-full text-left cursor-pointer rounded-xl hover:bg-white/[0.03]"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════ MOBILE HEADER ══════════════════════ */}
      <div className="md:hidden w-full flex flex-col min-h-screen bg-[#FAF9F7]">
        <div className="flex justify-between items-center px-5 py-4 bg-[#0F0F10] text-white border-b border-white/[0.06]">
          <Link to="/" className="block">
            <span className="text-base font-display tracking-widest uppercase text-white">ELESENE</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#0F0F10] border-b border-white/[0.06] overflow-hidden"
            >
              <div className="px-4 py-3 space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <NavItem key={item.label} item={item} onClick={() => setMobileMenuOpen(false)} />
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-[11px] font-futura tracking-[0.1em] uppercase text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      {/* ══════════════════════ DESKTOP MAIN AREA ══════════════════════ */}
      <div className="hidden md:flex flex-1 flex-col min-h-0 overflow-y-auto bg-[#FAF9F7]">

        {/* ── TOP NAVBAR ── */}
        <header className="sticky top-0 z-20 bg-[#FAF9F7]/90 backdrop-blur-md border-b border-[#ECE8E1] px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Greeting */}
            <div className="hidden lg:block">
              <h2 className="text-sm font-display font-semibold text-[#141414] tracking-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'} 👋
              </h2>
              <p className="text-[10px] text-[#6F6F6F] font-futura mt-0.5">Here's what's happening with your account today.</p>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6F6F]/60">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search products, orders…"
                  className="pl-9 pr-4 py-2 w-56 bg-white border border-[#ECE8E1] rounded-full text-xs text-[#141414] placeholder-[#6F6F6F]/50 focus:outline-none focus:ring-1 focus:ring-[#B99246] focus:border-[#B99246] font-futura transition-all duration-200"
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}
                />
              </div>

              {/* Cart */}
              <NavIconBtn label="Shopping Bag" onClick={openCart} badge={cartItems.length}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </NavIconBtn>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <NavIconBtn
                  label="Notifications"
                  onClick={() => setNotifOpen(o => !o)}
                  badge={unreadCount}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </NavIconBtn>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-12 w-80 bg-white border border-[#ECE8E1] rounded-2xl overflow-hidden z-50"
                      style={{ boxShadow: '0 16px 48px rgba(0,0,0,.12)' }}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ECE8E1]">
                        <h4 className="text-[10px] font-futura font-bold text-[#141414] uppercase tracking-widest">Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[9px] font-futura text-[#B99246] hover:text-[#141414] uppercase tracking-wider font-bold transition-colors cursor-pointer">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <div className="text-[#ECE8E1] mb-2">
                              <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                              </svg>
                            </div>
                            <p className="text-[10px] text-[#6F6F6F] font-futura">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <Link
                              key={n.id}
                              to="/account/notifications"
                              onClick={() => setNotifOpen(false)}
                              className={`block px-4 py-3 border-b border-[#F5F4F2] last:border-b-0 hover:bg-[#FAF9F7] transition-colors ${!n.is_read ? 'bg-[#B99246]/3' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-[#B99246]' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-futura font-bold text-[#141414] truncate">{n.title}</p>
                                  <p className="text-[10px] text-[#6F6F6F] font-futura line-clamp-2 mt-0.5">{n.message}</p>
                                  <p className="text-[9px] text-[#6F6F6F]/60 font-futura mt-1">
                                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-[#ECE8E1]">
                          <Link
                            to="/account/notifications"
                            onClick={() => setNotifOpen(false)}
                            className="block text-center text-[9px] font-futura text-[#B99246] hover:text-[#141414] uppercase tracking-widest font-bold transition-colors"
                          >
                            View all notifications →
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar / Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  aria-label="Profile Menu"
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B99246] to-[#D4AF6A] flex items-center justify-center text-white text-[10px] font-futura font-bold transition-all duration-200 group-hover:opacity-90"
                    style={{ boxShadow: '0 2px 10px rgba(185,146,70,.35)' }}
                  >
                    {userInitials}
                  </div>
                  <svg className="w-3 h-3 text-[#6F6F6F]/70 group-hover:text-[#141414] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-12 w-56 bg-white border border-[#ECE8E1] rounded-2xl overflow-hidden z-50"
                      style={{ boxShadow: '0 16px 48px rgba(0,0,0,.12)' }}
                    >
                      <div className="px-4 py-3.5 border-b border-[#ECE8E1]">
                        <p className="text-xs font-futura font-bold text-[#141414] truncate">{user?.full_name}</p>
                        <p className="text-[10px] text-[#6F6F6F] font-futura truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="py-1.5">
                        {[
                          { to: '/account/profile', label: 'My Profile' },
                          { to: '/account/orders', label: 'My Orders' },
                          { to: '/account/settings', label: 'Account Settings' },
                        ].map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs font-futura font-medium text-[#6F6F6F] hover:text-[#141414] hover:bg-[#FAF9F7] transition-all duration-150"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-[#ECE8E1] my-1.5 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-xs font-futura font-medium text-red-600 hover:text-red-700 hover:bg-red-50/60 transition-all duration-150 cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#ECE8E1] px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[9px] text-[#6F6F6F]/60 font-futura tracking-widest bg-white/40">
          <div className="flex gap-4 items-center flex-wrap justify-center sm:justify-start">
            <span>Secure Payments</span>
            <span className="opacity-40">•</span>
            <span>Easy Returns</span>
            <span className="opacity-40">•</span>
            <span>100% Authentic</span>
            <span className="opacity-40">•</span>
            <span>Customer Support</span>
          </div>
          <p>© {new Date().getFullYear()} Elesene. All rights reserved.</p>
        </footer>
      </div>

      <CartDrawer />
    </div>
  );
};

export default AccountLayout;
