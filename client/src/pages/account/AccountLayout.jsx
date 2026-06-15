import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';

const AccountLayout = () => {
  const { isAuthenticated, user, logout } = useCustomerAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const links = [
    { to: '/account', label: 'My Profile', exact: true },
    { to: '/account/orders', label: 'My Orders', exact: false },
    { to: '/account/addresses', label: 'Saved Addresses', exact: false },
    { to: '/account/wishlist', label: 'Wishlist', exact: false }
  ];

  return (
    <div className="min-h-screen bg-noir pt-32 pb-20 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-ivory tracking-wide mb-4">
            Welcome, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-ivory/50 font-futura tracking-wider text-sm uppercase">
            Manage your account and preferences
          </p>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden mb-8">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] px-4 py-3 rounded-lg text-ivory font-futura tracking-wider text-sm"
          >
            Account Menu
            <svg className={`w-4 h-4 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden">
                  {links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.exact}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        block px-4 py-3 text-sm font-futura tracking-wider transition-colors duration-300 border-b border-white/[0.04] last:border-0
                        ${isActive ? 'text-gold bg-gold/10' : 'text-ivory/50 hover:text-ivory hover:bg-white/[0.04]'}
                      `}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm font-futura tracking-wider text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.04] transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <nav className="space-y-1 relative">
              {/* Vertical line indicator container */}
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/[0.06]" />
              
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.exact}
                  className={({ isActive }) => `
                    relative flex items-center py-4 pl-6 text-sm font-futura tracking-[0.1em] uppercase transition-all duration-300 group
                    ${isActive ? 'text-gold' : 'text-ivory/50 hover:text-ivory'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator line */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div 
                            layoutId="activeAccountTab"
                            className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                      {/* Hover indicator line */}
                      {!isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/20 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-left" />
                      )}
                      {link.label}
                    </>
                  )}
                </NavLink>
              ))}
              
              <button 
                onClick={logout}
                className="relative w-full flex items-center py-4 pl-6 text-sm font-futura tracking-[0.1em] uppercase text-red-400/50 hover:text-red-400 transition-all duration-300 group mt-8"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-400/30 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-left" />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
