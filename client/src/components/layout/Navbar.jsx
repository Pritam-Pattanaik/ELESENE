import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import useUiStore from '../../store/uiStore';
import useCartStore from '../../store/cartStore';
import useCustomerAuthStore from '../../store/customerAuthStore';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > window.innerHeight - 50;
    }
    return false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { openCart } = useUiStore();
  const { items } = useCartStore();
  const { isAuthenticated, user, logout } = useCustomerAuthStore();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const bannerHeight = window.innerHeight; // HeroSection is 100vh
    if (latest > bannerHeight - 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    setMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/lookbook', label: 'Lookbook' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass-dark' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 h-20 flex items-center justify-end">
          {/* Right side (Auth, Cart & Menu) */}
          <div className="flex items-center gap-3">
            {/* Auth button */}
            {isAuthenticated ? (
              /* Logged-in user avatar */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[10px] font-futura font-bold tracking-wider hover:bg-gold/30 transition-all duration-300"
                >
                  {userInitials}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-56 bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl"
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-ivory text-sm font-futura font-medium truncate">{user?.full_name}</p>
                        <p className="text-ivory/30 text-xs font-futura truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link 
                          to="/account" 
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ivory/50 hover:text-ivory hover:bg-white/[0.04] transition-all duration-200 text-sm font-futura"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                          </svg>
                          My Account
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-ivory/50 hover:text-ivory hover:bg-white/[0.04] transition-all duration-200 text-sm font-futura"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                          </svg>
                          My Orders
                        </Link>
                      </div>
                      <div className="border-t border-white/[0.06] py-1">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.04] transition-all duration-200 text-sm font-futura w-full text-left"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login / Register button */
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 text-ivory/40 hover:text-gold border border-white/[0.06] hover:border-gold/20 rounded-full transition-all duration-300 text-[11px] font-futura tracking-[0.1em] uppercase"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
                Sign In
              </Link>
            )}

            {/* Cart */}
            <button 
              onClick={openCart} 
              className="p-2 text-ivory/50 hover:text-ivory transition-colors duration-300 relative"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {items.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-noir text-[9px] font-bold rounded-full flex items-center justify-center"
                >
                  {items.length}
                </motion.span>
              )}
            </button>

            {/* Hamburger — Cello style */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2 text-ivory/50 hover:text-ivory transition-colors duration-300 flex flex-col gap-[5px] items-end"
            >
              <motion.span 
                animate={{ width: menuOpen ? 20 : 20, rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] bg-current origin-left"
                style={{ width: 20 }}
              />
              <motion.span 
                animate={{ opacity: menuOpen ? 0 : 1, width: 14 }}
                transition={{ duration: 0.2 }}
                className="block h-[1.5px] bg-current"
                style={{ width: 14 }}
              />
              <motion.span 
                animate={{ width: menuOpen ? 20 : 8, rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
                transition={{ duration: 0.3 }}
                className="block h-[1.5px] bg-current origin-left"
                style={{ width: 8 }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[45] bg-noir flex flex-col justify-between"
          >
            <div className="max-w-[1400px] mx-auto px-8 md:px-16 pt-32 flex-1 flex flex-col md:flex-row md:items-center gap-16">
              {/* Nav links */}
              <div className="flex-1">
                <div className="space-y-2">
                  {navLinks.map((link, i) => (
                    <div key={link.label} className="overflow-hidden">
                      <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link 
                          to={link.to}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center gap-4 py-3"
                        >
                          <span className="text-[12px] font-futura text-ivory/20 tabular-nums">0{i + 1}</span>
                          <span className="text-4xl md:text-6xl font-display font-bold text-ivory uppercase tracking-wide group-hover:text-gold transition-colors duration-300">
                            {link.label}
                          </span>
                        </Link>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column — info + auth */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="md:w-80 space-y-8"
              >
                {/* Account section */}
                <div>
                  <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/30 block mb-3">Account</span>
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[11px] font-futura font-bold">
                          {userInitials}
                        </div>
                        <div>
                          <p className="text-ivory text-sm font-futura">{user?.full_name}</p>
                          <p className="text-ivory/25 text-xs font-futura">{user?.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-sm text-ivory/30 hover:text-red-400 transition-colors duration-300 font-futura"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Link 
                        to="/auth" 
                        onClick={() => setMenuOpen(false)}
                        className="px-5 py-2 bg-gold text-noir text-sm font-futura tracking-wider rounded-lg hover:bg-gold-light transition-colors duration-300"
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/auth" 
                        onClick={() => setMenuOpen(false)}
                        className="px-5 py-2 border border-white/[0.08] text-ivory/50 text-sm font-futura tracking-wider rounded-lg hover:text-ivory hover:border-white/20 transition-all duration-300"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/30 block mb-3">Social</span>
                  <div className="flex gap-6 text-sm text-ivory/50">
                    {['Instagram', 'Pinterest', 'X'].map(s => (
                      <a key={s} href="#" className="hover:text-gold transition-colors duration-300 font-futura">{s}</a>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/30 block mb-3">Get in Touch</span>
                  <a href="mailto:hello@elesene.in" className="text-sm text-ivory/50 hover:text-gold transition-colors font-futura">hello@elesene.in</a>
                </div>
              </motion.div>
            </div>

            {/* Bottom bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-[1400px] mx-auto px-8 md:px-16 py-8 w-full border-t border-white/[0.05]"
            >
              <p className="text-[10px] font-futura text-ivory/20 tracking-wider">
                © {new Date().getFullYear()} ELESENE · London, UK
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;


