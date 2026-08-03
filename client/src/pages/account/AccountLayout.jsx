import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import { getNotifications, markAllNotificationsRead } from '../../api/user';

const AccountLayout = () => {
  const { isAuthenticated, user, logout } = useCustomerAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Notification bell state
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Avatar profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Fetch notifications on mount / page change
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
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

  // User initials for avatar
  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Determine active path segment from current pathname
  const pathSegment = location.pathname.split('/account/')[1]?.replace(/\/$/, '') || 'profile';

  const links = [
    { 
      to: '/account/profile', 
      label: 'My Profile', 
      isActive: pathSegment === 'profile' || location.pathname === '/account' || location.pathname === '/account/',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    },
    { 
      to: '/account/orders', 
      label: 'My Orders', 
      isActive: pathSegment === 'orders',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375 3.75 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      )
    },
    { 
      to: '/account/wishlist', 
      label: 'Wishlist', 
      isActive: pathSegment === 'wishlist',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )
    },
    { 
      to: '/account/addresses', 
      label: 'Saved Addresses', 
      isActive: pathSegment === 'addresses',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
        </svg>
      )
    },
    { 
      to: '/account/payments', 
      label: 'Payment Methods', 
      isActive: pathSegment === 'payments',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      )
    },
    { 
      to: '/account/rewards', 
      label: 'Rewards & Club', 
      isActive: pathSegment === 'rewards',
      badge: 'ELITE',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    },
    { 
      to: '/account/notifications', 
      label: 'Notifications', 
      isActive: pathSegment === 'notifications',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      )
    },
    { 
      to: '/account/settings', 
      label: 'Account Settings', 
      isActive: pathSegment === 'settings',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      to: '/contact', 
      label: 'Help & Support', 
      isActive: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      )
    },
    { 
      to: '/', 
      label: 'Return to Store', 
      isActive: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-[#1C1C1C] font-body select-none">
      <CustomCursor />
      
      {/* DESKTOP SIDEBAR ON LEFT */}
      <aside className="hidden md:flex flex-col justify-between w-72 shrink-0 bg-[#0d0d0d] text-white p-8 border-r border-white/[0.08] min-h-screen">
        <div className="space-y-8">
          {/* Clickable Brand Logo linking to Home */}
          <Link to="/" className="text-left block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg p-1 -m-1">
            <span className="text-xl font-display font-bold tracking-[0.2em] text-white block uppercase group-hover:text-gold transition-colors duration-300">
              ELESENE
            </span>
            <span className="text-[8px] font-futura tracking-[0.25em] text-gold uppercase font-semibold block mt-1">
              BE YOU. BE ELESENE.
            </span>
          </Link>

          {/* Nav links */}
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`
                  relative flex items-center justify-between py-3 pl-4 pr-3 text-[11px] font-futura tracking-[0.12em] uppercase rounded-xl transition-all duration-300 group
                  ${link.isActive ? 'text-gold bg-gold/10' : 'text-white/60 hover:text-white hover:bg-white/[0.03]'}
                `}
              >
                {link.isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-gold rounded-full" />
                )}
                <div className="flex items-center gap-3">
                  <span className={`${link.isActive ? 'text-gold' : 'text-white/70'} group-hover:text-gold transition-colors`}>{link.icon}</span>
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[8px] font-futura tracking-widest bg-gold text-[#0d0d0d] px-1.5 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Club Box Promotion */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-futura tracking-widest text-white uppercase font-bold">ELESENE CLUB</span>
              <span className="text-gold text-xs">✦</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed font-light font-futura">
              You&apos;re an Elite Member. Enjoy exclusive offers and early access!
            </p>
            <Link 
              to="/account/rewards"
              className="block w-full py-2 border border-gold/30 hover:border-gold text-gold text-center text-[9px] font-futura tracking-widest uppercase font-bold rounded-lg bg-transparent transition-all duration-300"
            >
              EXPLORE BENEFITS
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <button 
          onClick={logout}
          className="flex items-center gap-3 py-3 pl-4 text-xs font-futura tracking-[0.12em] uppercase text-red-500/80 hover:text-red-400 transition-colors duration-300 w-full text-left cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MOBILE HEADER TOGGLE */}
      <div className="md:hidden w-full flex flex-col min-h-screen bg-[#FAF9F6]">
        <div className="flex justify-between items-center px-4 py-4 bg-[#0d0d0d] text-white">
          <Link to="/" className="text-left block group">
            <span className="text-lg font-display tracking-widest uppercase text-white group-hover:text-gold transition-colors">ELESENE</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center p-2 rounded border border-white/20"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#0d0d0d] border-b border-white/[0.08]"
            >
              <div className="px-4 py-2 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 text-xs font-futura tracking-wider uppercase transition-colors duration-300 rounded-lg
                      ${link.isActive ? 'text-gold bg-gold/10' : 'text-white/60 hover:text-white'}
                    `}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[8px] font-futura tracking-widest bg-gold text-[#0d0d0d] px-1.5 py-0.5 rounded-full font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-xs font-futura tracking-wider uppercase text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Outlet for Mobile */}
        <main className="flex-1 p-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-black/5 min-h-[300px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* DESKTOP MAIN AREA */}
      <div className="hidden md:flex flex-1 flex-col justify-between min-h-screen">
        <div className="p-8 space-y-8">
          
          {/* Top user header row */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-wide text-ivory flex items-center gap-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'} <span className="text-xl">👋</span>
              </h1>
              <p className="text-xs text-ivory/60 mt-1 font-futura">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>

            {/* Search, Notifications & Avatar */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Search for products, orders..."
                  className="pl-10 pr-4 py-2 w-full md:w-64 bg-white border border-black/5 rounded-xl text-xs text-ivory placeholder-black/40 focus:outline-none focus:border-gold transition-colors font-futura shadow-sm"
                />
              </div>

              {/* ── Notification Bell ── */}
              <div className="relative" ref={notifRef}>
                <button
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  onClick={() => setNotifOpen(o => !o)}
                  className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center text-ivory/80 relative hover:border-gold transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-11 w-80 bg-white border border-black/8 rounded-2xl overflow-hidden shadow-2xl z-50"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                        <h4 className="text-xs font-futura font-bold text-ivory uppercase tracking-wider">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-futura text-gold hover:text-yellow-600 uppercase tracking-wider font-bold transition-colors cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {/* Body */}
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-ivory/50 text-xs font-futura">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <Link
                              key={n.id}
                              to="/account/notifications"
                              onClick={() => setNotifOpen(false)}
                              className={`block px-4 py-3 hover:bg-black/[0.03] border-b border-black/5 last:border-b-0 transition-colors ${
                                !n.is_read ? 'bg-gold/[0.04]' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-gold' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-futura font-bold text-ivory truncate">{n.title}</p>
                                  <p className="text-[11px] text-ivory/60 font-futura line-clamp-2 mt-0.5">{n.message}</p>
                                  <p className="text-[9px] text-ivory/40 font-futura mt-1">
                                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-black/5">
                          <Link
                            to="/account/notifications"
                            onClick={() => setNotifOpen(false)}
                            className="block text-center text-[10px] font-futura text-gold hover:text-yellow-600 uppercase tracking-wider font-bold transition-colors"
                          >
                            View all notifications
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Avatar / Profile Dropdown ── */}
              <div className="relative" ref={profileRef}>
                <button
                  aria-label="Profile Menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-1.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[10px] font-futura font-bold hover:bg-gold/30 transition-all duration-300">
                    {userInitials}
                  </div>
                  <svg className="w-3 h-3 text-ivory/40 group-hover:text-ivory/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-11 w-52 bg-white border border-black/8 rounded-2xl overflow-hidden shadow-2xl z-50"
                    >
                      {/* User header */}
                      <div className="px-4 py-3 border-b border-black/5">
                        <p className="text-ivory text-xs font-bold truncate font-futura">{user?.full_name}</p>
                        <p className="text-ivory/60 text-[10px] font-futura truncate mt-0.5">{user?.email}</p>
                      </div>
                      {/* Menu items */}
                      <div className="py-1">
                        {[
                          { to: '/account/profile',  label: 'My Profile' },
                          { to: '/account/orders',   label: 'My Orders' },
                          { to: '/account/settings', label: 'Account Settings' },
                        ].map(item => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-ivory/70 hover:text-gold hover:bg-black/[0.03] transition-all duration-200 text-xs font-futura font-medium"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-black/5 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50/60 transition-all duration-200 text-xs font-futura font-medium cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Subpage / Outlet Rendering */}
          <main>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Custom Trust & Copyright Footer */}
        <footer className="border-t border-black/5 p-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-ivory/50 font-futura tracking-wider bg-white/30">
          <div className="flex gap-4 items-center flex-wrap justify-center sm:justify-start">
            <span>Secure Payments</span>
            <span className="opacity-30">•</span>
            <span>Easy Returns</span>
            <span className="opacity-30">•</span>
            <span>100% Authentic</span>
            <span className="opacity-30">•</span>
            <span>Customer Support</span>
          </div>
          <p>© 2025 Elesene. All rights reserved.</p>
        </footer>
      </div>

      <CartDrawer />
    </div>
  );
};

export default AccountLayout;
