import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { getUserProfile, getWishlist, getAddresses } from '../../api/user';
import { getUserOrders } from '../../api/orders';
import { getMyInvestmentSummary } from '../../api/loyalty';
import { ProfileSkeleton } from '../../components/common/Skeleton';

/* ─── Animated counter hook ─────────────────────────────────────────────── */
const useAnimatedCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
};

/* ─── Stat Card variants ─────────────────────────────────────────────────── */

/* Orders Card — white with a gold left accent bar */
const OrdersCard = ({ count }) => {
  const animCount = useAnimatedCounter(count);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-[#ECE8E1] p-6 flex items-start justify-between relative overflow-hidden group hover:shadow-[0_10px_35px_rgba(0,0,0,.06)] transition-shadow duration-300"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
    >
      {/* Gold left accent */}
      <div className="absolute left-0 top-6 bottom-6 w-[3px] bg-gradient-to-b from-[#B99246] to-[#D4AF6A] rounded-full" />
      <div className="pl-3">
        <span className="text-[10px] font-futura tracking-[0.18em] uppercase text-[#6F6F6F]">Orders Placed</span>
        <div className="text-4xl font-display font-bold text-[#141414] mt-1 tabular-nums">{animCount}</div>
        <Link to="/account/orders" className="text-[10px] font-futura tracking-widest text-[#B99246] uppercase hover:text-[#141414] inline-flex items-center gap-1 pt-3 font-bold transition-colors group-hover:gap-2">
          View your orders <span>→</span>
        </Link>
      </div>
      <div className="w-11 h-11 rounded-xl bg-[#FAF9F7] border border-[#ECE8E1] flex items-center justify-center text-[#B99246]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      </div>
    </motion.div>
  );
};

/* Wishlist Card — white with heart icon */
const WishlistCard = ({ count, highlights }) => {
  const animCount = useAnimatedCounter(count, 900);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 }}
      className="bg-white rounded-2xl border border-[#ECE8E1] p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_10px_35px_rgba(0,0,0,.06)] transition-shadow duration-300"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-futura tracking-[0.18em] uppercase text-[#6F6F6F]">Wishlist</span>
          <div className="text-4xl font-display font-bold text-[#141414] mt-1 tabular-nums">{animCount}</div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2 12.174 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.674-2.688 6.86-4.989 8.907a25.18 25.18 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      </div>
      {/* Mini image strip */}
      <div className="flex gap-1.5 mt-4">
        {(highlights || []).slice(0, 3).map((item, i) => (
          <div key={i} className="flex-1 aspect-square rounded-lg overflow-hidden border border-[#ECE8E1] bg-[#FAF9F7]">
            <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
        {(!highlights || highlights.length === 0) && [0,1,2].map(i => (
          <div key={i} className="flex-1 aspect-square rounded-lg bg-[#F5F4F2] border border-[#ECE8E1]" />
        ))}
      </div>
      <Link to="/account/wishlist" className="text-[10px] font-futura tracking-widest text-[#B99246] uppercase hover:text-[#141414] inline-flex items-center gap-1 pt-3 font-bold transition-colors">
        View wishlist →
      </Link>
    </motion.div>
  );
};

/* Reward Points Card — white with circular progress ring */
const RewardPointsCard = ({ points }) => {
  const animPoints = useAnimatedCounter(points, 1400);
  const maxPoints = 5000;
  const pct = Math.min((points / maxPoints) * 100, 100);
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      className="bg-white rounded-2xl border border-[#ECE8E1] p-6 flex items-start justify-between relative overflow-hidden group hover:shadow-[0_10px_35px_rgba(0,0,0,.06)] transition-shadow duration-300"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
    >
      <div>
        <span className="text-[10px] font-futura tracking-[0.18em] uppercase text-[#6F6F6F]">Reward Points</span>
        <div className="text-4xl font-display font-bold text-[#141414] mt-1 tabular-nums">
          {animPoints.toLocaleString()}
        </div>
        <span className="text-[10px] font-futura text-[#6F6F6F] tracking-wider pt-2 block">Available LP balance</span>
      </div>
      {/* Circular progress ring */}
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r={r} fill="none" stroke="#ECE8E1" strokeWidth="4" />
          <circle
            cx="24" cy="24" r={r} fill="none"
            stroke="#B99246" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * pct) / 100}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-futura font-bold text-[#B99246]">{Math.round(pct)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

/* Club Tier Card — gold gradient hero, double weight */
const ClubTierCard = ({ tier, investmentSummary }) => {
  const tierConfig = {
    seed:     { gradient: 'from-[#5C4A1E] via-[#7A6228] to-[#5C4A1E]', label: 'Seed',     badge: 'bg-[#B99246]/20 text-[#B99246] border-[#B99246]/40' },
    bronze:   { gradient: 'from-[#6B4226] via-[#8B5A3C] to-[#6B4226]', label: 'Bronze',   badge: 'bg-amber-900/20 text-amber-600 border-amber-600/40' },
    silver:   { gradient: 'from-[#3A3A3A] via-[#6B6B6B] to-[#3A3A3A]', label: 'Silver',   badge: 'bg-gray-100 text-gray-700 border-gray-400' },
    gold:     { gradient: 'from-[#6B4D0F] via-[#B99246] to-[#6B4D0F]', label: 'Gold',     badge: 'bg-[#B99246]/20 text-[#B99246] border-[#B99246]/60' },
    platinum: { gradient: 'from-[#2A2A4A] via-[#5A5A7A] to-[#2A2A4A]', label: 'Platinum', badge: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
    diamond:  { gradient: 'from-[#0A1628] via-[#1E3A5F] to-[#0A1628]', label: 'Diamond',  badge: 'bg-blue-50 text-blue-700 border-blue-300' },
  };
  const t = (tier || 'seed').toLowerCase();
  const cfg = tierConfig[t] || tierConfig.seed;
  const progressPct = investmentSummary?.progress?.progressPct || 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className={`rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden col-span-1 sm:col-span-2 lg:col-span-1 min-h-[180px] bg-gradient-to-br ${cfg.gradient}`}
      style={{ boxShadow: '0 10px 40px rgba(0,0,0,.18)' }}
    >
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-[9px] font-futura tracking-[0.25em] uppercase text-white/50 block">ELESENE CLUB</span>
          <div className="text-3xl font-display font-bold text-white mt-0.5 tracking-wide">{cfg.label}</div>
        </div>
        <span className={`text-[8px] font-futura tracking-widest uppercase px-2.5 py-1 rounded-full font-bold border ${cfg.badge}`}>
          {cfg.label.toUpperCase()}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5 relative z-10 mt-4">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#B99246] to-[#E8CC88] rounded-full transition-all duration-[1.8s] ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-futura text-white/50">
          <span className="text-white/80 font-semibold">
            {(investmentSummary?.metrics?.loyaltyPoints || 0).toLocaleString()} LP
          </span>
          {investmentSummary?.progress?.nextTier ? (
            <span>{(investmentSummary?.progress?.pointsToNext || 0).toLocaleString()} to {investmentSummary.progress.nextTier}</span>
          ) : (
            <span className="text-[#B99246] font-semibold">Pinnacle reached ✦</span>
          )}
        </div>
      </div>

      <Link to="/account/rewards" className="relative z-10 mt-4 text-[9px] font-futura tracking-widest text-white/60 hover:text-white uppercase font-bold transition-colors inline-flex items-center gap-1">
        View benefits →
      </Link>
    </motion.div>
  );
};

/* ─── Status pill helper ─────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const map = {
    Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Shipped:   'bg-blue-50 text-blue-700 border border-blue-200',
    Pending:   'bg-amber-50 text-amber-700 border border-amber-200',
    Cancelled: 'bg-red-50 text-red-600 border border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-futura font-bold tracking-widest uppercase ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
};

/* ─── Main ProfilePage ───────────────────────────────────────────────────── */
const ProfilePage = () => {
  const { user, updateUser } = useCustomerAuthStore();
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [points, setPoints] = useState(0);
  const [investmentSummary, setInvestmentSummary] = useState(null);
  const [stats, setStats] = useState({ ordersCount: 0, wishlistCount: 0, addressesCount: 0 });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ELS-98231',
      title: 'Linen Co-ord Set',
      date: 'May 20, 2025',
      status: 'Delivered',
      price: '₹2,499',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'ELS-98120',
      title: 'Satin Maxi Dress',
      date: 'May 15, 2025',
      status: 'Shipped',
      price: '₹3,999',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'ELS-97911',
      title: 'Minimal Shoulder Bag',
      date: 'May 10, 2025',
      status: 'Pending',
      price: '₹1,899',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&auto=format&fit=crop'
    }
  ]);

  const [wishlistHighlights] = useState([
    { price: '₹2,299', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=180&auto=format&fit=crop' },
    { price: '₹1,799', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=180&auto=format&fit=crop' },
    { price: '₹2,999', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=180&auto=format&fit=crop' },
  ]);

  const fetchShopperData = useCallback(async (silent = false) => {
    if (!silent) setFetchingProfile(true);
    try {
      const [profile, ordersList, wishlistList, addressesList, invSummary] = await Promise.all([
        getUserProfile(),
        getUserOrders(),
        getWishlist(),
        getAddresses(),
        getMyInvestmentSummary()
      ]);
      if (profile) { updateUser(profile); setPoints(profile.loyalty_points || 0); }
      if (invSummary) setInvestmentSummary(invSummary);
      setStats({
        ordersCount: ordersList?.length || 0,
        wishlistCount: wishlistList?.length || 0,
        addressesCount: addressesList?.length || 0,
      });
      if (ordersList?.length > 0) {
        const mapped = ordersList.slice(0, 3).map((ord) => ({
          id: ord.order_number || `ELS-${ord.id}`,
          title: ord.OrderItems?.[0]?.product_name || 'Couture Garment',
          date: new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: ord.status || 'Pending',
          price: `₹${parseFloat(ord.total_amount).toLocaleString()}`,
          image: ord.OrderItems?.[0]?.product_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&auto=format&fit=crop'
        }));
        setRecentOrders(mapped);
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      if (!silent) setFetchingProfile(false);
    }
  }, [updateUser]);

  useEffect(() => {
    const timer = setTimeout(() => fetchShopperData(true), 0);
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchShopperData(true);
    }, 15000);
    const handleFocus = () => fetchShopperData(true);
    window.addEventListener('focus', handleFocus);
    return () => { clearTimeout(timer); clearInterval(pollInterval); window.removeEventListener('focus', handleFocus); };
  }, [fetchShopperData]);

  if (fetchingProfile) return <ProfileSkeleton />;

  const tier = investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed';
  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="space-y-8 text-left pb-4">

      {/* ── SECTION 1: Greeting ── */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-[#141414] tracking-tight">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'} <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-[#6F6F6F] mt-1 font-futura tracking-wide">
          Here's your account at a glance — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── SECTION 2: 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OrdersCard count={stats.ordersCount} />
        <WishlistCard count={stats.wishlistCount} highlights={wishlistHighlights} />
        <RewardPointsCard points={points} />
        <ClubTierCard tier={tier} investmentSummary={investmentSummary} />
      </div>

      {/* ── SECTION 3: TWO-COLUMN MAIN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="bg-white rounded-2xl border border-[#ECE8E1] overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE8E1]">
              <h3 className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#141414] font-bold">Recent Orders</h3>
              <Link to="/account/orders" className="text-[10px] font-futura tracking-widest text-[#B99246] uppercase hover:text-[#141414] font-bold transition-colors inline-flex items-center gap-1">
                View All Orders →
              </Link>
            </div>

            <div className="divide-y divide-[#F5F4F2]">
              {recentOrders.map((ord, i) => (
                <motion.div
                  key={ord.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAF9F7] transition-colors group"
                >
                  <div className="w-12 h-16 rounded-xl overflow-hidden border border-[#ECE8E1] shrink-0 bg-[#F5F4F2]">
                    <img src={ord.image} alt={ord.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-futura font-semibold text-[#141414] truncate">{ord.title}</h4>
                    <p className="text-[10px] text-[#6F6F6F] font-futura mt-0.5">#{ord.id}</p>
                    <p className="text-[9px] text-[#6F6F6F]/70 font-futura mt-0.5">{ord.date}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <StatusPill status={ord.status} />
                    <span className="text-xs font-futura font-bold text-[#141414]">{ord.price}</span>
                  </div>
                  <button
                    onClick={() => alert(`Tracking for Order #${ord.id} will be sent via SMS.`)}
                    className="shrink-0 px-3 py-1.5 border border-[#ECE8E1] rounded-lg text-[9px] font-futura tracking-widest uppercase font-bold text-[#6F6F6F] hover:border-[#B99246] hover:text-[#B99246] transition-all duration-200 cursor-pointer bg-white"
                  >
                    Track
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Wishlist Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="bg-white rounded-2xl border border-[#ECE8E1] overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE8E1]">
              <h3 className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#141414] font-bold">Wishlist Highlights</h3>
              <Link to="/account/wishlist" className="text-[10px] font-futura tracking-widest text-[#B99246] uppercase hover:text-[#141414] font-bold transition-colors inline-flex items-center gap-1">
                View Wishlist →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3 p-6">
              {wishlistHighlights.map((item, idx) => (
                <div key={idx} className="space-y-2 group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#ECE8E1] bg-[#FAF9F7] relative">
                    <img src={item.image} alt={`Wishlist ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button aria-label="Remove from wishlist" className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm border border-[#ECE8E1] flex items-center justify-center text-rose-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[11px] font-futura font-semibold text-[#141414] text-center">{item.price}</p>
                </div>
              ))}
              {/* Empty slot */}
              <Link to="/shop" className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#ECE8E1] flex flex-col items-center justify-center gap-1 hover:border-[#B99246] transition-colors group/add">
                <svg className="w-5 h-5 text-[#ECE8E1] group-hover/add:text-[#B99246] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[8px] font-futura text-[#6F6F6F] tracking-wider uppercase group-hover/add:text-[#B99246] transition-colors">Add</span>
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">

          {/* ── ELESENE CLUB HERO CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26 }}
            className="bg-[#0F0F10] rounded-2xl text-white relative overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.22)' }}
          >
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#B99246]/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#B99246]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-futura tracking-[0.3em] text-white/40 uppercase block">ELESENE CLUB</span>
                  <h3 className="text-lg font-display font-bold text-white tracking-wide mt-0.5">
                    {tier.toUpperCase()} MEMBER
                  </h3>
                </div>
                <span className="text-[8px] font-futura tracking-widest bg-[#B99246] text-[#0F0F10] px-2.5 py-1 rounded-full font-bold uppercase">
                  {tier}
                </span>
              </div>

              {/* Points multiplier */}
              <p className="text-[11px] font-futura text-white/60 font-light leading-relaxed">
                {(() => {
                  const t = tier.toLowerCase();
                  if (t === 'diamond') return "You're earning 5x points on every purchase.";
                  if (t === 'platinum') return "You're earning 4x points on every purchase.";
                  if (t === 'gold') return "You're earning 3x points on every purchase.";
                  if (t === 'silver') return "You're earning 2x points on every purchase.";
                  if (t === 'bronze') return "You're earning 1.5x points on every purchase.";
                  return "You're earning 1x points on every purchase.";
                })()}
              </p>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#B99246] to-[#E8CC88]"
                    initial={{ width: 0 }}
                    animate={{ width: `${investmentSummary?.progress?.progressPct || 5}%` }}
                    transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-futura text-white/40">
                  <span>
                    <span className="text-white font-semibold">
                      {(investmentSummary?.metrics?.loyaltyPoints || user?.loyalty_points || 0).toLocaleString()} LP
                    </span>
                    {' '}Available
                  </span>
                  <span>
                    {investmentSummary?.progress?.nextTier
                      ? <><span className="text-white font-semibold">{(investmentSummary?.progress?.pointsToNext || 0).toLocaleString()} IP</span> to {investmentSummary.progress.nextTier}</>
                      : <span className="text-[#B99246] font-semibold">Pinnacle Status ✦</span>
                    }
                  </span>
                </div>
              </div>

              {/* Hairline divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Perks grid */}
              {(() => {
                const t = tier.toLowerCase();
                const unlocked = ['silver', 'gold', 'platinum', 'diamond'].includes(t);
                const perks = [
                  {
                    label: 'Early Access', sub: 'To New Drops', active: unlocked,
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  },
                  {
                    label: 'Exclusive Offers', sub: 'Just for You', active: true,
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.573.463a18.029 18.029 0 005.52-5.52c.409-.793.236-1.874-.464-2.573L9.568 3z" />
                  },
                  {
                    label: 'Free Shipping', sub: 'On All Orders', active: unlocked,
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5" />
                  },
                ];
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {perks.map((perk, i) => (
                      <div key={i} className={`space-y-1.5 text-center ${perk.active ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center mx-auto ${perk.active ? 'border-[#B99246]/40 text-[#B99246] bg-[#B99246]/5' : 'border-white/10 text-white/30'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            {perk.icon}
                          </svg>
                        </div>
                        <div className="text-[8px] font-futura font-bold tracking-wider text-white uppercase leading-tight">{perk.label}</div>
                        <div className="text-[7px] text-white/35 font-futura">{perk.sub}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* ── ACCOUNT INFO CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="bg-white rounded-2xl border border-[#ECE8E1] overflow-hidden"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE8E1]">
              <h3 className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#141414] font-bold">Account Information</h3>
              <Link to="/account/settings" className="text-[10px] font-futura tracking-widest text-[#B99246] uppercase hover:text-[#141414] font-bold transition-colors">
                Edit
              </Link>
            </div>

            <div className="p-6 space-y-5">
              {/* Avatar row */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B99246] to-[#D4AF6A] flex items-center justify-center text-white font-display font-bold text-lg shadow-md shrink-0">
                  {userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-futura font-bold text-[#141414]">{user?.full_name || 'Your Name'}</span>
                    {/* Verified badge */}
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-futura font-bold text-[#B99246] bg-[#B99246]/10 px-1.5 py-0.5 rounded-full border border-[#B99246]/20 tracking-wider">
                      <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6F6F6F] font-futura">{tier} Member · ELESENE Club</span>
                </div>
              </div>

              {/* Hairline separator */}
              <div className="border-t border-[#F5F4F2]" />

              {/* Info fields */}
              <div className="space-y-4">
                {[
                  { label: 'Email', value: user?.email || '—' },
                  { label: 'Phone', value: user?.phone || '—' },
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '2025' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[9px] font-futura tracking-widest uppercase text-[#6F6F6F]">{label}</span>
                    <span className="text-xs font-futura font-semibold text-[#141414]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Hairline separator */}
              <div className="border-t border-[#F5F4F2]" />

              {/* Security block */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF9F7] border border-[#ECE8E1]">
                <div className="w-8 h-8 rounded-full border border-[#B99246]/30 flex items-center justify-center text-[#B99246] shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-futura font-bold text-[#141414] tracking-wide">Your Account is Secure</p>
                  <p className="text-[9px] text-[#6F6F6F] font-futura mt-0.5">We protect your data and privacy.</p>
                </div>
                <button
                  onClick={() => alert('Security settings managed via identity service.')}
                  className="text-[8px] font-futura tracking-widest uppercase font-bold text-[#B99246] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Manage →
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
