import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import HeroSection from '../../components/home/HeroSection';
import InteractiveModelShowcase from '../../components/home/InteractiveModelShowcase';
import SEO from '../../components/layout/SEO';
import GlamourDressesSection from '../../components/home/GlamourDressesSection';
import CollectionsAndNewArrivals from '../../components/home/CollectionsAndNewArrivals';
import CurvedRingArchive from '../../components/home/CurvedRingArchive';

/* ─── Scrolling model & typography marquee section ─── */
const ScrollingTextSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ['15%', '-55%']);

  const marqueeItems = [
    { type: 'text', text: 'TRENDING', italic: false },
    { type: 'image', url: '/images/fashion-red-suit.jpg', tag: 'RED SUIT', slug: 'scarlet-double-breasted-suit' },
    { type: 'text', text: 'NOW', italic: true },
    { type: 'image', url: '/images/fashion-organza-blouse.jpg', tag: 'ORGANZA RUFFLE', slug: 'ethereal-organza-ruffle-blouse' },
    { type: 'text', text: 'NEW', italic: false },
    { type: 'image', url: '/images/fashion-chunky-knit.jpg', tag: 'CHUNKY KNIT', slug: 'ivory-open-weave-chunky-sweater' },
    { type: 'text', text: 'NOW', italic: true },
    { type: 'image', url: '/images/fashion-noir-set.jpg', tag: 'NOIR DUO', slug: 'noir-sleeveless-turtleneck-set' },
    { type: 'text', text: 'TRENDING', italic: false },
    { type: 'image', url: '/images/fashion-embroidered-blouse.jpg', tag: 'EMBROIDERED SILK', slug: 'botanical-embroidered-silk-blouse' },
    { type: 'text', text: 'NOW', italic: true },
    { type: 'image', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop', tag: 'SILK SLIP', slug: 'silk-slip-dress' },
    { type: 'text', text: 'TRENDING', italic: false },
    { type: 'image', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', tag: 'COUTURE COAT', slug: 'noir-tailored-suit' },
    { type: 'text', text: 'NOW', italic: true },
    { type: 'image', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop', tag: 'SATIN EDIT', slug: 'luxe-satin-dress' },
    { type: 'text', text: 'TRENDING', italic: false },
    { type: 'image', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', tag: 'LINEN SET', slug: 'linen-belted-set' },
    { type: 'text', text: 'NOW', italic: true },
    { type: 'image', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop', tag: 'PARTY EDIT', slug: 'crystal-embellished-top' },
  ];

  return (
    <section ref={ref} className="py-16 overflow-hidden border-y border-white/20 glass-subtle relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gold/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <motion.div style={{ x }} className="flex items-center gap-14 whitespace-nowrap">
        {marqueeItems.map((item, idx) => {
          if (item.type === 'text') {
            return (
              <span 
                key={idx} 
                className={`text-[clamp(1.5rem,4.5vw,3rem)] font-serif font-black uppercase tracking-widest select-none shrink-0 ${
                  item.italic ? 'text-gold italic font-light' : 'text-ivory'
                }`}
              >
                {item.text}
              </span>
            );
          } else {
            return (
              <Link 
                to={`/product/${item.slug}`}
                key={idx} 
                className="w-[140px] md:w-[200px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 relative group shrink-0 shadow-md transition-all duration-500 hover:scale-105 hover:border-gold/30 glass-shimmer block cursor-pointer"
              >
                <img 
                  src={item.url} 
                  alt={item.tag} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                <span className="absolute bottom-3 left-3 text-[7.5px] font-sans tracking-[0.15em] uppercase text-white font-semibold glass-dark-md px-2.5 py-0.5 rounded-full border border-white/10 shadow-md">
                  {item.tag}
                </span>
              </Link>
            );
          }
        })}
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════ HOMEPAGE ═══════════════════════════════════════ */
const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const attemptScroll = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!attemptScroll()) {
        const intervalId = setInterval(() => {
          if (attemptScroll()) {
            clearInterval(intervalId);
          }
        }, 100);
        setTimeout(() => clearInterval(intervalId), 3000);
      }
    }
  }, [location.hash]);

  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-white">
      <SEO 
        title="Home" 
        description="Experience luxury fashion redefined. Shop curated collections, bridal wear, and exclusive accessories at ELESENE." 
      />
      <CustomCursor />
      <Navbar />
      
      <main>
        <HeroSection />
        
        <ScrollingTextSection />

        {/* Side-by-Side Interactive Dual Model Showcase */}
        <InteractiveModelShowcase />

        <GlamourDressesSection />
        <CollectionsAndNewArrivals />
        <section id="atelier-ring">
          <CurvedRingArchive theme="light" accent="neutral" embedded={true} />
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default HomePage;
