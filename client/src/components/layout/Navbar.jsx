/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ELESENE — CLIENT FRONTEND NAVIGATION NAVBAR & MENU DRAWER
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Description:
 * This component renders the main shopping navbar header and the responsive 
 * mobile/tablet side-drawer slide navigation menu.
 * 
 * TABLE OF CONTENTS:
 * 1. IMPORTS & SUB-ICONS
 * 2. MAIN NAVBAR CONTROLLER:
 *    - State definitions (menuOpen, userDropdown, langDropdown)
 *    - Hooks & scroll listeners (scrollY trackers for header transformations)
 *    - Side effect synchronization (body lock on scroll, wishlist fetch counts)
 *    - Action click handler utilities (logout, search, smooth scrolling)
 * 3. DESKTOP HEADER NAVBAR RENDERING
 * 4. MOBILE / TABLET SLIDE-OUT MENU SIDE DRAWER RENDERING
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import useUiStore from '../../store/uiStore';
import useCartStore from '../../store/cartStore';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useWishlistStore from '../../store/wishlistStore';
import useFocusTrap from '../../hooks/useFocusTrap';
import { getNotifications, markAllNotificationsRead } from '../../api/user';
import { getCustomerToken } from '../../api/authHelper';

// ─── 1. IMPORTS & SUB-ICONS ──────────────────────────────────────────────────
const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Read wishlist count directly from store — no extra API call needed
  const wishlistIds = useWishlistStore(s => s.wishlistIds);

  const drawerRef = useFocusTrap(menuOpen, () => setMenuOpen(false));

  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const { openCart } = useUiStore();
  const { items } = useCartStore();
  const { isAuthenticated, user, logout } = useCustomerAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const displayActiveSection = '';

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Lock body scroll when overlay menu drawer is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Wishlist count from store (no extra API call)
  const isUserLogged = Boolean(getCustomerToken() || isAuthenticated);
  const displayWishlistCount = isUserLogged ? wishlistIds.length : 0;

  // Fetch notifications once on login, not on every route change
  useEffect(() => {
    if (!isAuthenticated) return;
    getNotifications({ limit: 5 })
      .then(data => {
        setNotifications(data?.notifications || []);
        setUnreadCount(data?.unreadCount || 0);
      })
      .catch(err => console.error('Error fetching notifications:', err))
      .finally(() => setNotifLoading(false));
  }, [isAuthenticated]); // ← removed location.pathname: was firing on every page nav

  // Focus search input when active
  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  // Close dropdown selections when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    useWishlistStore.getState().clearWishlist();
    setUserDropdown(false);
    setNotifOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    try {
      const data = await markAllNotificationsRead();
      setUnreadCount(data?.unreadCount || 0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchActive(false);
      setSearchQuery('');
    }
  };

  const handleNavLinkClick = (e, to) => {
    if (to.startsWith('/#')) {
      const hash = to.split('#')[1];
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        setMenuOpen(false);
      }
    } else if (to === '/') {
      if (location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMenuOpen(false);
      }
    }
  };

  const handleNavLinkHover = (to) => {
    if (to.startsWith('/shop')) import('../../pages/shop/ShopPage');
    else if (to.startsWith('/lookbook')) import('../../pages/lookbook/LookbookPage');
    else if (to.startsWith('/about')) import('../../pages/about/AboutPage');
    else if (to.startsWith('/contact')) import('../../pages/contact/ContactPage');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/#collections', label: 'Collections' },
    { to: '/#atelier-ring', label: 'Atelier' },
  ];

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const isHome = location.pathname === '/';
  const showSolidNavbar = isScrolled || !isHome;

  const languages = ['EN', 'FR', 'ES', 'DE'];

  // ─── 3. DESKTOP HEADER NAVBAR RENDERING ────────────────────────────────────
  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showSolidNavbar 
            ? 'glass-navbar-scrolled py-3.5' 
            : 'glass-navbar py-4.5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          {/* Logo Brand */}
          <Link 
            to="/" 
            onClick={(e) => handleNavLinkClick(e, '/')}
            className="flex flex-col select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
          >
            <span className="font-display text-lg md:text-xl font-bold tracking-[0.2em] text-ivory leading-none uppercase">ELESENE</span>
            <span className="text-[7px] md:text-[8px] font-futura font-light tracking-[0.25em] text-gold uppercase mt-0.5">BE YOU. BE ELESENE.</span>
          </Link>

          {/* Center Links (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-10" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const hash = link.to.startsWith('/#') ? link.to.split('#')[1] : '';
              const isActive = hash 
                ? displayActiveSection === hash 
                : location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={(e) => handleNavLinkClick(e, link.to)}
                  onMouseEnter={() => handleNavLinkHover(link.to)}
                  className={`text-[11px] font-futura font-medium tracking-[0.2em] uppercase transition-colors duration-300 relative py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm ${
                    isActive ? 'text-gold' : 'text-ivory/70 hover:text-gold'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span 
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions row */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Live Search bar */}
            <div className={`flex items-center transition-all duration-300 ${searchActive ? 'w-44 md:w-60 border-b border-black/20' : 'w-0 border-b border-transparent'}`}>
              <form onSubmit={handleSearchSubmit} className="w-full flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search collections, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent text-ivory placeholder-ivory/40 text-xs font-futura w-full py-1 outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-gold ${
                    searchActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              </form>
            </div>

             {/* Search Icon Trigger */}
             <button
               onClick={() => setSearchActive(!searchActive)}
               className="p-1.5 text-ivory/70 hover:text-gold transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
               aria-label="Toggle search field"
               aria-expanded={searchActive}
             >
               <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </button>

             {/* Notification Bell */}
             {isAuthenticated && (
               <div className="relative" ref={notifRef}>
                 <button
                   onClick={() => setNotifOpen(!notifOpen)}
                   className="p-1.5 text-ivory/70 hover:text-gold transition-colors duration-300 relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
                   aria-label="Notifications"
                   aria-expanded={notifOpen}
                 >
                   <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-10 w-80 glass-dropdown-card rounded-2xl overflow-hidden shadow-2xl z-50"
                      >
                       <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                         <h4 className="text-xs font-futura font-bold text-ivory uppercase tracking-wider">Notifications</h4>
                         {unreadCount > 0 && (
                           <button
                             onClick={handleMarkAllRead}
                             className="text-[10px] font-futura text-gold hover:text-gold-light uppercase tracking-wider font-bold transition-colors"
                           >
                             Mark all read
                           </button>
                         )}
                       </div>
                       <div className="max-h-80 overflow-y-auto">
                         {notifLoading ? (
                           <div className="px-4 py-6 text-center text-ivory/50 text-xs font-futura">Loading...</div>
                         ) : notifications.length === 0 ? (
                           <div className="px-4 py-6 text-center text-ivory/50 text-xs font-futura">No notifications yet</div>
                         ) : (
                           notifications.map(n => (
                             <Link
                               key={n.id}
                               to="/account/notifications"
                               onClick={() => setNotifOpen(false)}
                               className={`block px-4 py-3 hover:bg-black/5 transition-colors border-b border-black/5 last:border-b-0 ${!n.is_read ? 'bg-gold/[0.03]' : ''}`}
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
                       {notifications.length > 0 && (
                         <div className="px-4 py-2 border-t border-black/5">
                           <Link
                             to="/account/notifications"
                             onClick={() => setNotifOpen(false)}
                             className="block text-center text-[10px] font-futura text-gold hover:text-gold-light uppercase tracking-wider font-bold transition-colors"
                           >
                             View all notifications
                           </Link>
                         </div>
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             )}

            {/* Shopper Wishlist icon */}
            <Link
              to="/account/wishlist"
              onClick={(e) => {
                if (!isUserLogged) {
                  e.preventDefault();
                  navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to view your wishlist.' } });
                }
              }}
              className="p-1.5 text-ivory/70 hover:text-gold transition-colors duration-300 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
              aria-label={`Wishlist (${displayWishlistCount} items)`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {displayWishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-[6px] h-[6px] rounded-full bg-gold" />
              )}
            </Link>

            {/* Cart Drawer Icon */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/auth', { state: { from: location.pathname, message: 'Please sign in or register to view your shopping bag.' } });
                } else {
                  openCart();
                }
              }}
              className="p-1.5 text-ivory/70 hover:text-gold transition-colors duration-300 relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
              aria-label={`Shopping Bag (${isAuthenticated ? items.length : 0} items)`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {isAuthenticated && items.length > 0 && (
                <span className="absolute top-1 right-1 w-[6px] h-[6px] rounded-full bg-gold" />
              )}
            </button>

            {/* User Account avatar or dropdown icon */}
            <div className="relative" ref={dropdownRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  aria-label="User Account Menu"
                  aria-expanded={userDropdown}
                  className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[9px] font-futura font-bold hover:bg-gold/30 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {userInitials}
                </button>
              ) : (
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="p-1.5 text-ivory/70 hover:text-gold transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
                  aria-label="Account Menu"
                  aria-expanded={userDropdown}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </button>
              )}

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-10 w-56 glass-dropdown-card rounded-2xl overflow-hidden shadow-2xl z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-black/5">
                          <p className="text-ivory text-xs font-bold truncate font-futura">{user?.full_name}</p>
                          <p className="text-ivory/70 text-[10px] font-futura truncate mt-0.5">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link 
                            to="/account/profile" 
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-ivory/70 hover:text-gold hover:bg-black/5 transition-all duration-200 text-xs font-futura font-medium"
                          >
                            My Profile
                          </Link>
                          <Link 
                            to="/account/orders" 
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-ivory/70 hover:text-gold hover:bg-black/5 transition-all duration-200 text-xs font-futura font-medium"
                          >
                            My Orders
                          </Link>
                          <Link 
                            to="/account/settings" 
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-ivory/70 hover:text-gold hover:bg-black/5 transition-all duration-200 text-xs font-futura font-medium"
                          >
                            Account Settings
                          </Link>
                          <div className="border-t border-black/5 my-1" />
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 text-xs font-futura w-full text-left cursor-pointer font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-2 space-y-1">
                        <Link 
                          to="/auth" 
                          onClick={() => setUserDropdown(false)}
                          className="block text-center text-xs py-2 bg-ivory text-white rounded-lg font-futura font-medium hover:bg-gold hover:text-noir transition-all"
                        >
                          Sign In
                        </Link>
                        <Link 
                          to="/auth" 
                          onClick={() => setUserDropdown(false)}
                          className="block text-center text-xs py-2 border border-black/10 text-ivory/70 rounded-lg font-futura hover:text-ivory hover:border-black/20 transition-all"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Selector (Desktop only) */}
            <div className="relative hidden md:block" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                aria-label="Select language"
                aria-expanded={langDropdown}
                className="flex items-center gap-1 p-1.5 text-ivory/70 hover:text-gold transition-colors duration-300 text-xs font-futura cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                </svg>
                <span className="uppercase text-[11px] font-futura tracking-wide">{currentLang}</span>
                <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <AnimatePresence>
                {langDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-10 w-28 glass-dropdown-card rounded-2xl overflow-hidden shadow-2xl z-50"
                  >
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setCurrentLang(lang);
                            setLangDropdown(false);
                          }}
                          className={`w-full text-center px-4 py-2 text-xs font-futura transition-colors cursor-pointer ${
                            currentLang === lang ? 'text-gold font-bold bg-black/5' : 'text-ivory/70 hover:text-gold hover:bg-black/5'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Join Now CTA Button (Desktop only) */}
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="hidden sm:inline-block px-5 py-2.5 glass-gold hover:bg-gold/20 hover:border-gold/50 text-gold font-futura text-xs tracking-widest uppercase font-semibold rounded-xl shadow-md transition-all duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Join Now
              </Link>
            ) : (
              <Link
                to="/account"
                className="hidden sm:inline-block px-5 py-2.5 bg-black/5 hover:bg-black/10 border border-black/10 text-ivory font-futura text-xs tracking-widest uppercase font-semibold rounded-lg transition-all duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Account
              </Link>
            )}

            {/* Mobile Hamburger menu toggle button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              className="lg:hidden p-2 text-ivory/70 hover:text-gold transition-colors duration-300 flex flex-col gap-[5px] items-end shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
            >
              <motion.span 
                animate={{ width: menuOpen ? 20 : 20, rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] bg-current origin-left w-5"
              />
              <motion.span 
                animate={{ opacity: menuOpen ? 0 : 1, width: 14 }}
                transition={{ duration: 0.2 }}
                className="block h-[1.5px] bg-current w-3.5"
              />
              <motion.span 
                animate={{ width: menuOpen ? 20 : 8, rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] bg-current origin-left w-2"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ─── 4. MOBILE / TABLET SLIDE-OUT MENU SIDE DRAWER RENDERING ─────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Blurred backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm touch-none"
            />

            {/* Sidebar Drawer container (slides from the right) */}
            <motion.div
              id="mobile-nav-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] z-[101] glass-dropdown-card rounded-none border-l border-gold/20 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
            >
              <div>
                {/* Header brand & close controls */}
                <div className="flex items-center justify-between border-b border-black/5 pb-6 mb-8">
                  <div className="flex flex-col">
                    <span className="font-display text-lg tracking-widest text-gold font-bold">ELESENE</span>
                    <span className="text-[8px] tracking-[0.2em] text-ivory/70 uppercase mt-0.5 font-semibold">Luxe Collection</span>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-1.5 rounded-full border border-black/10 hover:border-black/20 text-ivory/70 hover:text-ivory transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation links block */}
                <div className="space-y-1 mb-8">
                  <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/70 block mb-4 font-semibold">Navigation</span>
                  {navLinks.map((link, i) => (
                    <Link 
                      key={link.label}
                      to={link.to}
                      onClick={(e) => {
                        handleNavLinkClick(e, link.to);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 py-3 group border-b border-black/5 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                    >
                      <span className="text-[10px] font-futura text-ivory/40 tabular-nums">0{i + 1}</span>
                      <span className="text-xl font-futura font-medium text-ivory/80 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Account & Details Info blocks */}
                <div className="space-y-6 mb-8">
                  {/* Account authentication indicators */}
                  <div>
                    <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/70 block mb-3 font-semibold">Account</span>
                    {isAuthenticated ? (
                      <div className="flex items-center justify-between p-3 rounded-xl glass-dark border-white/[0.07]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[10px] font-futura font-bold">
                            {userInitials}
                          </div>
                          <div className="max-w-[160px]">
                            <p className="text-ivory text-xs font-futura font-bold truncate">{user?.full_name}</p>
                            <p className="text-ivory/70 text-[10px] font-futura truncate">{user?.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="text-[11px] text-red-600 hover:text-red-700 font-futura transition-colors font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Link 
                          to="/auth" 
                          onClick={() => setMenuOpen(false)}
                          className="flex-1 text-center py-2 bg-ivory hover:bg-gold text-white hover:text-noir text-xs font-futura tracking-wide font-semibold rounded-lg transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          Sign In
                        </Link>
                        <Link 
                          to="/auth" 
                          onClick={() => setMenuOpen(false)}
                          className="flex-1 text-center py-2 border border-black/10 text-ivory/70 hover:text-ivory hover:border-black/20 text-xs font-futura tracking-wide rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Social sharing links */}
                  <div>
                    <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/70 block mb-3 font-semibold">Social</span>
                    <div className="flex gap-4 text-xs text-ivory/70">
                      {['Instagram', 'Pinterest', 'X'].map(s => (
                        <a key={s} href="#" className="hover:text-gold transition-colors font-futura focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{s}</a>
                      ))}
                    </div>
                  </div>

                  {/* Contact/Support touch endpoint */}
                  <div>
                    <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/70 block mb-2 font-semibold">Get in Touch</span>
                    <a href="mailto:hello@elesene.in" className="text-xs text-ivory/70 hover:text-gold transition-colors font-futura focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">hello@elesene.in</a>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright and Location */}
              <div className="pt-6 border-t border-black/5">
                <p className="text-[9px] font-futura text-ivory/50 tracking-wider">
                  © {new Date().getFullYear()} ELESENE · London, UK
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
