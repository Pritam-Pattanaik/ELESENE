import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import MagneticButton from '../../components/effects/MagneticButton';
import HeroSection from '../../components/home/HeroSection';
import TrendingCarousel from '../../components/home/TrendingCarousel';
import ScrollFrameAnimation from '../../components/home/ScrollFrameAnimation';
import SEO from '../../components/layout/SEO';
import GlamourDressesSection from '../../components/home/GlamourDressesSection';

/* ─── Scrolling text reveal section ─── */
const ScrollingTextSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);

  return (
    <section ref={ref} className="py-24 overflow-hidden border-y border-white/[0.04]">
      <motion.div style={{ x }} className="flex items-center gap-12 whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="text-[clamp(3rem,8vw,7rem)] font-display font-black text-ivory uppercase tracking-tight drop-shadow-lg">New Season</span>
            <span className="accent-dot" />
            <span className="text-[clamp(3rem,8vw,7rem)] font-display font-black text-ivory uppercase tracking-tight italic drop-shadow-lg">Collection 2026</span>
            <span className="accent-dot" />
          </span>
        ))}
      </motion.div>
    </section>
  );
};



/* ─── About section — Cello studio info style ─── */
const AboutSection = () => (
  <section className="py-32 md:py-44 px-8 md:px-16 max-w-[1400px] mx-auto">
    <div className="grid md:grid-cols-2 gap-16 md:gap-24">
      <ScrollReveal variant="fade-up">
        <h2 className="text-3xl md:text-5xl font-display text-ivory leading-[1.15] font-bold">
          ELESENE is a UK-based fashion house curating modern luxury for the modern woman.
        </h2>
      </ScrollReveal>
      
      <div className="space-y-8">
        <ScrollReveal variant="fade-up" delay={0.15}>
          <p className="text-ivory/40 text-base leading-relaxed font-light">
            We shape wardrobes through clear curation, refined craftsmanship, and thoughtful design systems. Fashion that feels intentional, consistent, and built to last — from everyday elegance to statement pieces.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.25}>
          <div className="flex flex-wrap gap-3">
            {['Evening Wear', 'Bridal', 'Resort', 'Accessories', 'Prêt-à-Porter', 'Custom'].map(tag => (
              <span key={tag} className="px-4 py-2 border border-white/[0.06] text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 rounded-full hover:border-gold/30 hover:text-gold/60 transition-all duration-300">
                {tag}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.35}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/[0.05]">
            {[
              { num: '12+', label: 'Cities' },
              { num: '6', label: 'Years' },
              { num: '24', label: 'Awards' },
              { num: '500+', label: 'Collections' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-display font-bold text-ivory">{stat.num}</p>
                <p className="text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/25 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);

/* ─── Services / What We Offer — numbered accordion ─── */
const services = [
  { num: '01', title: 'Curated Collections', items: ['Seasonal Drops', 'Limited Edition Capsules', 'Designer Collaborations'] },
  { num: '02', title: 'Personal Styling', items: ['1-on-1 Style Consultation', 'Wardrobe Curation', 'Occasion Dressing'] },
  { num: '03', title: 'Bridal Studio', items: ['Custom Bridal Wear', 'Trousseau Planning', 'Wedding Guest Edit'] },
  { num: '04', title: 'Bespoke Tailoring', items: ['Made-to-Measure', 'Fabric Selection', 'Alteration Services'] },
  { num: '05', title: 'Corporate Gifting', items: ['Premium Gift Sets', 'Branded Packaging', 'Bulk Ordering'] },
];

const ServicesSection = () => (
  <section className="section-light pt-16 pb-32 md:pt-24 md:pb-44">
    <div className="max-w-[1400px] mx-auto px-8 md:px-16">
      <ScrollReveal variant="fade-up">
        <p className="text-noir/40 text-base md:text-lg max-w-2xl leading-relaxed font-light mb-20">
          We help women find their signature style through curated fashion experiences that connect with their identity and stand the test of time.
        </p>
      </ScrollReveal>

      <div className="divide-y divide-noir/[0.08]">
        {services.map((svc) => (
          <ScrollReveal key={svc.num} variant="fade-up" className="py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16">
            <span className="text-sm font-futura text-noir/40 tabular-nums w-8 flex-shrink-0">{svc.num}</span>
            <h3 className="text-2xl md:text-4xl font-display font-bold text-noir uppercase tracking-wide md:w-1/3">
              {svc.title}
            </h3>
            <div className="flex-1 flex flex-wrap gap-x-8 gap-y-4">
              {svc.items.map(item => (
                <span key={item} className="text-sm font-futura text-noir/80 tracking-wide flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  {item}
                </span>
              ))}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Testimonial ─── */
const TestimonialSection = () => (
  <section className="py-32 md:py-44 px-8 md:px-16 max-w-[1400px] mx-auto">
    <ScrollReveal variant="fade-up">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl text-gold/30 font-display mb-8">"</div>
        <blockquote className="text-2xl md:text-4xl font-display text-ivory/80 leading-relaxed italic mb-10">
          ELESENE delivered a wardrobe that perfectly captures my vision — elegant, modern, and effortlessly sophisticated. Every piece feels intentional.
        </blockquote>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-futura font-medium text-ivory/60">Ananya Sharma</p>
          <p className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold/40">Creative Director, Studio Noor</p>
        </div>
      </div>
    </ScrollReveal>
  </section>
);

/* ─── FAQ — Cello style ─── */
const faqs = [
  { q: 'How do I choose the right size?', a: 'Each product includes a detailed size guide. For a perfect fit, we recommend our virtual consultation service where our stylists guide you through measurements.' },
  { q: 'What is your return policy?', a: 'We offer hassle-free returns within 14 days of delivery. Items must be unworn with original tags attached. Exchange and store credit options are also available.' },
  { q: 'Do you offer custom tailoring?', a: 'Yes. Our bespoke service includes fabric selection, measurements, and multiple fittings to create one-of-a-kind pieces tailored to your exact specifications.' },
  { q: 'How long does shipping take?', a: 'Standard delivery within UK takes 3-5 business days. Express shipping (next-day) is available for metro cities. International shipping takes 7-12 business days.' },
  { q: 'Can I schedule a styling session?', a: 'Absolutely. Book a complimentary 30-minute virtual styling session with our in-house experts. We will help curate looks for any occasion.' },
];

const FAQSection = () => (
  <section className="section-light py-32 md:py-44">
    <div className="max-w-[1400px] mx-auto px-8 md:px-16">
      <div className="grid md:grid-cols-2 gap-16 md:gap-24">
        <div className="md:sticky md:top-32 self-start">
          <ScrollReveal variant="fade-up">
            <h2 className="text-5xl md:text-7xl font-display font-black text-noir uppercase tracking-tight mb-6">FAQ</h2>
            <p className="text-noir/40 text-sm font-light mb-8 max-w-sm">
              Got questions? We are here to make things easy. Browse common questions or reach out directly.
            </p>
          </ScrollReveal>
        </div>

        <div className="divide-y divide-noir/[0.08]">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.05}>
              <details className="group py-6">
                <summary className="flex justify-between items-start gap-4 cursor-pointer list-none select-none">
                  <h4 className="text-base md:text-lg font-display font-semibold text-noir group-hover:text-gold transition-colors duration-300 pr-4">
                    {faq.q}
                  </h4>
                  <span className="text-noir/30 text-lg flex-shrink-0 mt-0.5 transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="text-noir/40 text-sm font-light leading-relaxed mt-3 pr-8">
                  {faq.a}
                </p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─── Bottom Marquee ─── */
const BottomMarquee = () => (
  <section className="py-24 md:py-32 border-y border-white/[0.02] overflow-hidden group/marquee relative cursor-default">
    <div className="absolute inset-0 bg-gradient-to-r from-noir via-transparent to-noir z-10 pointer-events-none" />
    <div className="absolute inset-0 bg-gold/[0.02] opacity-0 group-hover/marquee:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
    
    <div className="flex whitespace-nowrap transition-all duration-700" style={{ animation: 'marquee-scroll 40s linear infinite' }}>
      {[...Array(6)].map((_, i) => (
        <span key={i} className="flex items-center gap-16 mx-8">
          <span className="text-7xl md:text-9xl font-display font-black tracking-tighter text-ivory/80 group-hover/marquee:text-gold transition-colors duration-500 select-none">
            ELESENE
          </span>
          <span className="text-3xl md:text-5xl text-gold/60">✧</span>
          <span className="text-7xl md:text-9xl font-display font-black tracking-tighter text-ivory/80 group-hover/marquee:text-gold transition-colors duration-500 select-none">
            CURATED LUXURY
          </span>
          <span className="text-3xl md:text-5xl text-gold/60">✧</span>
        </span>
      ))}
    </div>
  </section>
);

/* ─── Features for Second Animation ─── */
const features2 = [
  {
    id: 1,
    title: 'Fluid Motion',
    description: 'Garments designed to move gracefully, adapting to your every step with effortless elegance.',
    tag: 'Dynamic Form',
    range: [0.08, 0.25],
    side: 'left',
  },
  {
    id: 2,
    title: 'Textured Depths',
    description: 'Intricate weaves and layered fabrics add an unexpected tactile dimension to minimalist designs.',
    tag: 'Material Focus',
    range: [0.28, 0.45],
    side: 'right',
  },
  {
    id: 3,
    title: 'Subtle Accents',
    description: 'Hand-finished details and understated embellishments that catch the light just right.',
    tag: 'Craftsmanship',
    range: [0.48, 0.65],
    side: 'left',
  },
  {
    id: 4,
    title: 'Modern Classic',
    description: 'Timeless silhouettes reimagined for the contemporary wardrobe, blending heritage with innovation.',
    tag: 'Vision',
    range: [0.68, 0.85],
    side: 'right',
  },
];

/* ═══════════════════════════════════════ HOMEPAGE ═══════════════════════════════════════ */
const HomePage = () => {
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

        {/* Scroll-driven Frame Animation 1 */}
        <ScrollFrameAnimation />

        {/* Scroll-driven Frame Animation 2 */}
        <ScrollFrameAnimation 
          totalFrames={154}
          framePath="/Video_2_Frames/ezgif-frame-"
          tag="The Next Chapter"
          title="Keep Exploring"
          features={features2}
          canvasMaxWidth="30vw"
          canvasPaddingTop="16vh"
        />

        <GlamourDressesSection />

        <AboutSection />

        <TrendingCarousel />

        {/* Scroll Hint */}
        <div className="relative py-6 md:py-8">
          <div className="max-w-[1400px] mx-auto px-8 md:px-16">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-3 animate-bounce">
                <svg className="w-4 h-4 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <svg className="w-4 h-4 text-gold/30 -mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-sm font-futura tracking-[0.3em] uppercase text-ivory/30">
                Scroll here to see
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-ivory/10 to-transparent" />
            </div>
          </div>
        </div>


        <TestimonialSection />

        <FAQSection />

        <BottomMarquee />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default HomePage;
