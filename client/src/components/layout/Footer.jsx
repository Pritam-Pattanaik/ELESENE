import { useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../effects/ScrollReveal';
import TermsAndConditionsModal from '../investment/TermsAndConditionsModal';

const Footer = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const bannerImages = [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=350&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=350&auto=format&fit=crop'
  ];

  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Welcome to ELESENE World.`);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-[#0d0d0d] pt-16 pb-8 overflow-hidden border-t border-white/[0.08] font-body select-none">
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        
        {/* TIER 1: LOOKBOOK BANNER & GOLD SEAL */}
        <ScrollReveal variant="fade-up">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 border border-white/[0.08] bg-[#111111] rounded-3xl overflow-hidden mb-16 shadow-2xl">
            {/* Left Column: Editorial Info */}
            <div className="lg:col-span-4 p-8 md:p-10 flex flex-col justify-center items-start z-10 relative bg-[#111111]">
              <h3 className="text-xl md:text-2xl font-display font-bold tracking-wider text-gold uppercase">
                ELESENE WORLD
              </h3>
              <p className="text-xs font-futura text-white/60 max-w-xs leading-relaxed mt-2.5 font-light">
                Be inspired by our community, and discover endless style.
              </p>
              <Link 
                to="/lookbook"
                className="group flex items-center justify-between gap-4 px-5 py-3 border border-white/20 hover:border-gold hover:text-gold text-[10px] font-futura tracking-[0.2em] uppercase font-bold rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold mt-6"
              >
                <span>EXPLORE LOOKBOOK</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Right Column: Image Strip with Gold Seal */}
            <div className="lg:col-span-8 relative flex items-center overflow-hidden border-t lg:border-t-0 lg:border-l border-white/[0.08] pl-6 py-6 bg-[#0a0a0a]">
              {/* Overlapping Rotating Gold Seal */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden lg:flex z-20">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-gold/30 flex items-center justify-center bg-[#0d0d0d] shadow-2xl relative shrink-0">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite] pointer-events-none select-none">
                    <defs>
                      <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text className="text-[6.2px] font-futura uppercase tracking-[0.14em] font-medium" fill="#C9A84C">
                      <textPath href="#circlePath">ELESENE STYLE IS ETERNAL • ELESENE STYLE IS ETERNAL • </textPath>
                    </text>
                  </svg>
                  <div className="text-2xl font-display font-semibold text-white tracking-widest z-10 select-none">E</div>
                </div>
              </div>

              {/* Square Image Row */}
              <div className="flex gap-3 overflow-hidden select-none w-full">
                {bannerImages.map((url, idx) => (
                  <div key={idx} className="w-24 h-24 md:w-28 md:h-28 shrink-0 overflow-hidden rounded-xl border border-white/[0.06] shadow-lg group">
                    <img 
                      src={url} 
                      alt={`Atelier Look ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* TIER 2: BENEFITS & NEWSLETTER SUBSCRIPTION */}
        <ScrollReveal variant="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 border-t border-b border-white/[0.08] mb-16 items-center">
            {/* Left Value Props (8 cols on desktop) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Benefit 1 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0 glass-gold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3L8 9l4 12 4-12-3-6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20" />
                  </svg>
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold text-white">EXCLUSIVE OFFERS</h4>
                  <p className="text-[10.5px] text-white/50 font-futura font-light">For members only</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0 glass-gold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 7H2v5h20V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold text-white">EARLY ACCESS</h4>
                  <p className="text-[10.5px] text-white/50 font-futura font-light">To new collections</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0 glass-gold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7a2.5 2.5 0 112-2.5V7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7L2 16.5a1.5 1.5 0 001 2.5h18a1.5 1.5 0 001-2.5L12 7z" />
                  </svg>
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold text-white">STYLE INSPO</h4>
                  <p className="text-[10.5px] text-white/50 font-futura font-light">Tips & trends</p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0 glass-gold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l5.136-5.136a2.25 2.25 0 000-3.182L11.16 3.659A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold text-white">SPECIAL REWARDS</h4>
                  <p className="text-[10.5px] text-white/50 font-futura font-light">Earn while you shop</p>
                </div>
              </div>
            </div>

            {/* Right Newsletter Form (4 cols on desktop) */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 flex flex-col items-stretch text-left">
              <h4 className="text-xs font-futura font-bold tracking-[0.2em] text-white uppercase">
                BECOME AN ELESENE INSIDER
              </h4>
              <p className="text-[10px] font-futura text-white/50 tracking-wider mt-1.5 mb-4">
                Join now & get 10% OFF your first order.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <label htmlFor="footer-email-input" className="sr-only">Email Address</label>
                <input 
                  id="footer-email-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-dark border border-white/15 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-gold transition-colors font-futura flex-grow"
                />
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gold text-noir text-[10px] font-futura font-bold tracking-widest rounded-md hover:bg-gold-light transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </div>
        </ScrollReveal>

        {/* TIER 3: BRAND DIRECTORY & COPYRIGHT LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-16 text-left">
          {/* Logo Column */}
          <div className="sm:col-span-2 space-y-5">
            <Link to="/" className="flex flex-col items-start gap-0.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
              <span className="text-xl font-display font-bold text-white tracking-[0.15em] uppercase group-hover:text-gold transition-colors duration-300">
                ELESENE
              </span>
            </Link>
            <p className="text-[11px] text-white/70 font-futura font-light leading-relaxed max-w-xs">
              Elevated fashion for the modern woman. Timeless style. Unmatched quality.
            </p>
            {/* Social Icons with circular borders */}
            <div className="flex gap-3 pt-1">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/10 hover:border-gold flex items-center justify-center text-white/70 hover:text-gold transition-all duration-300 glass-dark glass-dark-hover">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/10 hover:border-gold flex items-center justify-center text-white/70 hover:text-gold transition-all duration-300 bg-white/[0.01]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="w-9 h-9 rounded-full border border-white/10 hover:border-gold flex items-center justify-center text-white/70 hover:text-gold transition-all duration-300 bg-white/[0.01]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <line x1="6" y1="18" x2="18" y2="6" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full border border-white/10 hover:border-gold flex items-center justify-center text-white/70 hover:text-gold transition-all duration-300 bg-white/[0.01]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold mb-5 text-gold">SHOP</h4>
            <ul className="space-y-3 text-[11px] text-white/70 font-futura font-light">
              <li><Link to="/#collections" className="hover:text-gold transition-colors duration-300">New In</Link></li>
              <li><Link to="/#glamour-dresses" className="hover:text-gold transition-colors duration-300">Dresses</Link></li>
              <li><Link to="/shop" className="hover:text-gold transition-colors duration-300">Clothing</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-gold transition-colors duration-300">Accessories</Link></li>
              <li><Link to="/#collections" className="hover:text-gold transition-colors duration-300">Collections</Link></li>
              <li><Link to="/shop" className="hover:text-gold transition-colors duration-300">Sale</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold mb-5 text-gold">CUSTOMER CARE</h4>
            <ul className="space-y-3 text-[11px] text-white/70 font-futura font-light">
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">Shipping & Delivery</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">Returns & Exchanges</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold mb-5 text-gold">ABOUT</h4>
            <ul className="space-y-3 text-[11px] text-white/70 font-futura font-light">
              <li><Link to="/about" className="hover:text-gold transition-colors duration-300">Our Story</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors duration-300">Careers</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors duration-300">Sustainability</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors duration-300">Press</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors duration-300">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h4 className="text-[10px] font-futura tracking-widest uppercase font-bold mb-5 text-gold">ACCOUNT</h4>
            <ul className="space-y-3 text-[11px] text-white/70 font-futura font-light">
              <li><Link to="/profile" className="hover:text-gold transition-colors duration-300">My Account</Link></li>
              <li><Link to="/profile?tab=orders" className="hover:text-gold transition-colors duration-300">Orders</Link></li>
              <li><Link to="/profile?tab=wishlist" className="hover:text-gold transition-colors duration-300">Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-gold transition-colors duration-300">Rewards</Link></li>
              <li><Link to="/profile" className="hover:text-gold transition-colors duration-300">Gift Cards</Link></li>
            </ul>
          </div>
        </div>

        {/* TIER 4: TRUST ASSURANCES & PAYMENT BADGES */}
        <div className="border-t border-white/[0.08] py-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          {/* Payment badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-[10px] font-futura tracking-widest text-white/50 uppercase select-none">WE ACCEPT</span>
            <div className="flex gap-2.5 items-center flex-wrap">
              {/* Visa */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center text-[10px] font-bold text-[#1A1F71] tracking-wider select-none font-futura shadow-md">VISA</div>
              {/* Mastercard */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center gap-0.5 select-none shadow-md">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] -mr-1.5" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
              </div>
              {/* Amex */}
              <div className="h-6 w-10 bg-[#0070D2] rounded flex items-center justify-center text-[9px] font-bold text-white tracking-widest select-none font-futura shadow-md">AMEX</div>
              {/* PayPal */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center text-[10px] font-extrabold italic text-[#003087] select-none font-futura shadow-md">PayPal</div>
              {/* Apple Pay */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center gap-1 select-none text-[10px] font-semibold text-black font-sans shadow-md">
                <span></span><span>Pay</span>
              </div>
              {/* Google Pay */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center gap-1 select-none text-[10px] font-semibold text-[#5F6368] font-sans shadow-md">
                <span className="text-[#4285F4] font-bold">G</span><span>Pay</span>
              </div>
            </div>
          </div>

          {/* Trust assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 xl:gap-8">
            {/* Assur 1 */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="space-y-0.5 text-left select-none">
                <h4 className="text-[10px] font-futura tracking-wider uppercase font-bold text-white">SECURE PAYMENTS</h4>
                <p className="text-[9px] text-white/50 font-futura font-light">100% secure checkout</p>
              </div>
            </div>

            {/* Assur 2 */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.75a1.125 1.125 0 01-1.125-1.125V15h1.5m1.5 3.75V15m10.5 3.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h.75m-1.5 0H14.25M16.5 9h-3.75m3.75 3h-3.75m1.5 6.75h1.5a1.125 1.125 0 001.125-1.125v-4.135m0 0l-3-3m3 3h1.5a1.125 1.125 0 001.125-1.125v-2.25a2.625 2.625 0 00-2.625-2.625h-4.064M12 18.75V7.5H9.75M9.75 7.5H5.25A1.125 1.125 0 004.125 8.625v6.375" />
              </svg>
              <div className="space-y-0.5 text-left select-none">
                <h4 className="text-[10px] font-futura tracking-wider uppercase font-bold text-white">FREE SHIPPING</h4>
                <p className="text-[9px] text-white/50 font-futura font-light">On orders above ₹4999</p>
              </div>
            </div>

            {/* Assur 3 */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <div className="space-y-0.5 text-left select-none">
                <h4 className="text-[10px] font-futura tracking-wider uppercase font-bold text-white">EASY RETURNS</h4>
                <p className="text-[9px] text-white/50 font-futura font-light">Hassle-free returns</p>
              </div>
            </div>

            {/* Assur 4 */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3L8 9l4 12 4-12-3-6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20" />
              </svg>
              <div className="space-y-0.5 text-left select-none">
                <h4 className="text-[10px] font-futura tracking-wider uppercase font-bold text-white">PREMIUM QUALITY</h4>
                <p className="text-[9px] text-white/50 font-futura font-light">Finest fabrics & craftsmanship</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA BAR */}
        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/50 font-futura tracking-wider">
          <p>© 2025 Elesene. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <Link to="/about" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <span className="opacity-30">|</span>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-gold transition-colors cursor-pointer">Terms &amp; Conditions</button>
            <span className="opacity-30">|</span>
            <Link to="/about" className="hover:text-gold transition-colors">Cookies Policy</Link>
          </div>
        </div>

        <TermsAndConditionsModal
          isOpen={isTermsOpen}
          onClose={() => setIsTermsOpen(false)}
        />
      </div>
    </footer>
  );
};

export default Footer;
