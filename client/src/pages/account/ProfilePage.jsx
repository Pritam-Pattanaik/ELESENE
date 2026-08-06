import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { getUserProfile, getWishlist, getAddresses } from '../../api/user';
import { getUserOrders } from '../../api/orders';
import { getMyInvestmentSummary } from '../../api/loyalty';
import { ProfileSkeleton } from '../../components/common/Skeleton';

const ProfilePage = () => {
  const { user, updateUser } = useCustomerAuthStore();
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [points, setPoints] = useState(1250);
  const [investmentSummary, setInvestmentSummary] = useState(null);
  const [stats, setStats] = useState({
    ordersCount: 12,
    wishlistCount: 18,
    addressesCount: 4
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ELS-98231',
      title: 'Linen Co-ord Set',
      date: 'May 20, 2025',
      status: 'Delivered',
      statusColor: 'text-green-600 bg-green-50',
      price: '₹2,499',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'ELS-98120',
      title: 'Satin Maxi Dress',
      date: 'May 15, 2025',
      status: 'Shipped',
      statusColor: 'text-blue-600 bg-blue-50',
      price: '₹3,999',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'ELS-97911',
      title: 'Minimal Shoulder Bag',
      date: 'May 10, 2025',
      status: 'Delivered',
      statusColor: 'text-green-600 bg-green-50',
      price: '₹1,899',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&auto=format&fit=crop'
    }
  ]);

  const [wishlistHighlights] = useState([
    {
      price: '₹2,299',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=180&auto=format&fit=crop'
    },
    {
      price: '₹1,799',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=180&auto=format&fit=crop'
    },
    {
      price: '₹2,999',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=180&auto=format&fit=crop'
    },
    {
      price: '₹1,299',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=180&auto=format&fit=crop'
    }
  ]);

  const fetchShopperData = async (silent = false) => {
    if (!silent) setFetchingProfile(true);
    try {
      const [profile, ordersList, wishlistList, addressesList, invSummary] = await Promise.all([
        getUserProfile(),
        getUserOrders(),
        getWishlist(),
        getAddresses(),
        getMyInvestmentSummary()
      ]);
      
      if (profile) {
        updateUser(profile);
        setPoints(profile.loyalty_points || 0);
      }

      if (invSummary) {
        setInvestmentSummary(invSummary);
      }
      
      setStats({
        ordersCount: ordersList?.length || 12,
        wishlistCount: wishlistList?.length || 18,
        addressesCount: addressesList?.length || 4
      });

      if (ordersList && ordersList.length > 0) {
        // Map backend orders into view model
        const mapped = ordersList.slice(0, 3).map((ord) => ({
          id: ord.order_number || `ELS-${ord.id}`,
          title: ord.OrderItems?.[0]?.product_name || 'Couture Garment',
          date: new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: ord.status || 'Delivered',
          statusColor: ord.status === 'Shipped' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50',
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
  };

  useEffect(() => {
    fetchShopperData();

    // Poll for real-time updates every 15 seconds when active
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchShopperData(true);
      }
    }, 15000);

    // Refresh immediately when window comes back into focus
    const handleFocus = () => {
      fetchShopperData(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (fetchingProfile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* TIER 1: STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Orders */}
        <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-futura text-ivory/50 tracking-wider">Orders Placed</span>
            <h3 className="text-2xl font-display font-bold text-ivory">{stats.ordersCount}</h3>
            <Link to="/account/orders" className="text-[10px] font-futura tracking-widest text-gold uppercase hover:underline inline-flex items-center gap-1 pt-1.5 font-bold">
              View your orders <span className="text-xs">→</span>
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Wishlist */}
        <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-futura text-ivory/50 tracking-wider">Wishlist Items</span>
            <h3 className="text-2xl font-display font-bold text-ivory">{stats.wishlistCount}</h3>
            <Link to="/account/wishlist" className="text-[10px] font-futura tracking-widest text-gold uppercase hover:underline inline-flex items-center gap-1 pt-1.5 font-bold">
              View wishlist <span className="text-xs">→</span>
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Reward Points */}
        <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-futura text-ivory/50 tracking-wider">Reward Points</span>
            <h3 className="text-2xl font-display font-bold text-ivory">{points.toLocaleString()}</h3>
            <p className="text-[10px] text-ivory/50 tracking-wider font-futura font-light pt-2">Available points</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.561 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Club Tier */}
        <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-futura text-ivory/50 tracking-wider">Club Tier</span>
            <h3 className="text-2xl font-display font-bold text-gold tracking-wide">
              {investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed'}
            </h3>
            {(() => {
              const tier = (investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed').toLowerCase();
              if (['platinum', 'diamond'].includes(tier)) {
                return <p className="text-[10px] text-green-600/80 tracking-wider font-futura font-bold pt-2">You&apos;re on our highest tier!</p>;
              }
              if (['silver', 'gold'].includes(tier)) {
                return <p className="text-[10px] text-gold tracking-wider font-futura font-bold pt-2">Concierge privileges active!</p>;
              }
              return <p className="text-[10px] text-zinc-500 tracking-wider font-futura font-semibold pt-2">Grow your brand standing</p>;
            })()}
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        </div>
      </div>

      {/* TIER 2: TWO-COLUMN MAIN CONTENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (Recent Orders & Wishlist Highlights) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Box 1: Recent Orders */}
          <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-futura tracking-wider text-ivory uppercase font-bold">Recent Orders</h4>
              <Link to="/account/orders" className="text-[10px] font-futura tracking-widest text-gold uppercase hover:underline font-bold">
                View All Orders →
              </Link>
            </div>

            <div className="divide-y divide-black/5">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img src={ord.image} alt={ord.title} className="w-12 h-16 rounded-lg object-cover border border-black/5" />
                    <div>
                      <h5 className="text-xs font-semibold text-ivory font-futura">{ord.title}</h5>
                      <p className="text-[10px] text-ivory/50 font-futura mt-0.5">Order #{ord.id}</p>
                      <p className="text-[9px] text-ivory/40 font-futura mt-0.5">{ord.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="space-y-0.5">
                      <span className={`inline-block text-[9px] font-futura tracking-widest uppercase font-bold px-2 py-0.5 rounded-full ${ord.statusColor}`}>
                        {ord.status}
                      </span>
                      <p className="text-xs font-bold text-ivory font-futura">{ord.price}</p>
                    </div>
                    <button 
                      onClick={() => alert(`Tracking information for Order #${ord.id} will be sent via SMS.`)}
                      className="px-3.5 py-1.5 border border-black/10 hover:border-gold hover:text-gold rounded-lg text-[9px] font-futura tracking-widest uppercase font-bold transition-colors cursor-pointer bg-white"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Wishlist Highlights */}
          <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-futura tracking-wider text-ivory uppercase font-bold">Wishlist Highlights</h4>
              <Link to="/account/wishlist" className="text-[10px] font-futura tracking-widest text-gold uppercase hover:underline font-bold">
                View Wishlist →
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {wishlistHighlights.map((item, idx) => (
                <div key={idx} className="space-y-2 text-center group relative">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-black/5 bg-noir/5 relative">
                    <img src={item.image} alt={`Wishlist ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {/* Heart badge overlay */}
                    <button aria-label="Remove from wishlist" className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-black/5 flex items-center justify-center text-gold shadow-sm hover:scale-115 transition-transform">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-[11px] font-semibold text-ivory font-futura">{item.price}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Elesene Club Progress Card & Account Details) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dark Elesene Club VIP card */}
          <div className="bg-[#0b0b0b] border border-white/[0.08] text-white rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />

            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[10px] font-futura tracking-[0.25em] text-white/50 uppercase block">ELESENE CLUB</span>
                <span className="text-xs font-display tracking-widest text-white uppercase font-bold block">
                  {(investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed').toUpperCase()} MEMBER
                </span>
              </div>
              <span className="text-[8px] font-futura tracking-widest bg-gold text-[#0d0d0d] px-2.5 py-0.5 rounded-full font-bold uppercase select-none">
                {investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed'}
              </span>
            </div>

            <p className="text-[11px] font-futura text-white/70 font-light">
              {(() => {
                const tier = (investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed').toLowerCase();
                if (tier === 'diamond') return "You're earning 5x points on every purchase.";
                if (tier === 'platinum') return "You're earning 4x points on every purchase.";
                if (tier === 'gold') return "You're earning 3x points on every purchase.";
                if (tier === 'silver') return "You're earning 2x points on every purchase.";
                if (tier === 'bronze') return "You're earning 1.5x points on every purchase.";
                return "You're earning 1x points on every purchase.";
              })()}
            </p>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${investmentSummary?.progress?.progressPct || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-futura tracking-wider text-white/50">
                <div>
                  <span className="text-white font-bold">
                    {(investmentSummary?.metrics?.loyaltyPoints || user?.loyalty_points || 0).toLocaleString()} LP
                  </span> Available Balance
                </div>
                <div>
                  {investmentSummary?.progress?.nextTier ? (
                    <span>
                      <span className="text-white font-bold">
                        {(investmentSummary?.progress?.pointsToNext || 0).toLocaleString()} IP
                      </span> to {investmentSummary.progress.nextTier}
                    </span>
                  ) : (
                    <span className="text-gold font-bold">Pinnacle Status Reached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Horizontal VIP Perks list */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
              {/* Perk 1 */}
              {(() => {
                const tier = (investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed').toLowerCase();
                const unlocked = ['silver', 'gold', 'platinum', 'diamond'].includes(tier);
                return (
                  <div className={`space-y-1.5 ${unlocked ? 'opacity-100' : 'opacity-35'}`}>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center mx-auto bg-white/[0.01] ${unlocked ? 'border-gold/30 text-gold shadow-[0_0_8px_rgba(217,119,6,0.2)]' : 'border-white/[0.08] text-white/40'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7a2.5 2.5 0 112-2.5V7" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7L2 16.5a1.5 1.5 0 001 2.5h18a1.5 1.5 0 001-2.5L12 7z" />
                      </svg>
                    </div>
                    <h5 className="text-[9px] font-futura font-bold tracking-wider text-white uppercase leading-none">Early Access</h5>
                    <p className="text-[8px] text-white/40 font-futura leading-none">To New Drops</p>
                  </div>
                );
              })()}

              {/* Perk 2 */}
              <div className="space-y-1.5 opacity-100">
                <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-gold mx-auto bg-white/[0.01] shadow-[0_0_8px_rgba(217,119,6,0.2)]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l5.136-5.136a2.25 2.25 0 000-3.182L11.16 3.659A2.25 2.25 0 009.568 3z" />
                  </svg>
                </div>
                <h5 className="text-[9px] font-futura font-bold tracking-wider text-white uppercase leading-none">Exclusive Offers</h5>
                <p className="text-[8px] text-white/40 font-futura leading-none">Just for You</p>
              </div>

              {/* Perk 3 */}
              {(() => {
                const tier = (investmentSummary?.metrics?.investmentTier || user?.investmentTier || 'Seed').toLowerCase();
                const unlocked = ['silver', 'gold', 'platinum', 'diamond'].includes(tier);
                return (
                  <div className={`space-y-1.5 ${unlocked ? 'opacity-100' : 'opacity-35'}`}>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center mx-auto bg-white/[0.01] ${unlocked ? 'border-gold/30 text-gold shadow-[0_0_8px_rgba(217,119,6,0.2)]' : 'border-white/[0.08] text-white/40'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.75a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007" />
                      </svg>
                    </div>
                    <h5 className="text-[9px] font-futura font-bold tracking-wider text-white uppercase leading-none">Free Shipping</h5>
                    <p className="text-[8px] text-white/40 font-futura leading-none">On All Orders</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="bg-[#161616] border border-white/[0.07] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-futura tracking-wider text-ivory uppercase font-bold">Account Information</h4>
              <button 
                onClick={() => alert("Please contact concierge support to update verified details.")}
                className="text-[10px] font-futura tracking-widest text-gold uppercase hover:underline font-bold"
              >
                Edit
              </button>
            </div>

            <div className="space-y-4 text-xs font-futura">
              <div>
                <span className="text-[9px] tracking-wider text-ivory/40 uppercase block">Full Name</span>
                <span className="text-ivory font-semibold block mt-0.5">{user?.full_name || 'Bhagya'}</span>
              </div>
              <div>
                <span className="text-[9px] tracking-wider text-ivory/40 uppercase block">Email Address</span>
                <span className="text-ivory font-semibold block mt-0.5">{user?.email || 'bhagya123@gmail.com'}</span>
              </div>
              <div>
                <span className="text-[9px] tracking-wider text-ivory/40 uppercase block">Phone Number</span>
                <span className="text-ivory font-semibold block mt-0.5">{user?.phone || '+91 98765 43210'}</span>
              </div>
            </div>

            {/* Secure Account shield block */}
            <div className="border border-gold/15 bg-gold/[0.02] rounded-xl p-4.5 flex gap-4 items-center">
              <div className="w-10 h-10 shrink-0 rounded-full border border-gold/30 flex items-center justify-center text-gold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="flex-1 space-y-1 text-left">
                <h5 className="text-[10px] font-futura tracking-wider text-ivory uppercase font-bold">Your Account is Secure</h5>
                <p className="text-[9px] text-ivory/50 font-futura leading-relaxed">We protect your data and keep your account safe.</p>
                <button 
                  onClick={() => alert("Multi-factor verification settings are configured via identity service.")}
                  className="mt-1 px-3 py-1.5 border border-gold/30 hover:border-gold rounded-lg text-[8px] font-futura tracking-widest uppercase font-bold text-gold bg-transparent transition-colors cursor-pointer"
                >
                  MANAGE SECURITY
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;

