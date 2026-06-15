import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import SEO from '../../components/layout/SEO';

const lookbookImages = [
  { id: 1, src: encodeURI('/Glamour dresses/Isabella 🥰.jpg'), title: 'Chapter I', desc: 'The Awakening' },
  { id: 2, src: encodeURI("/Glamour dresses/Jennie in a black short tight dress  (It's Ai generated).jpg"), title: 'Chapter II', desc: 'Midnight Silence' },
  { id: 3, src: encodeURI('/Glamour dresses/Alizabeauty.jpg'), title: 'Chapter III', desc: 'Ethereal Form' },
];

const LookbookPage = () => {
  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-white">
      <SEO title="Lookbook" description="A visual journey through our latest editorial campaigns." />
      <CustomCursor />
      <Navbar />

      <main className="pt-32 md:pt-48 pb-32 overflow-hidden">
        {/* Header */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 mb-32 md:mb-48">
          <ScrollReveal variant="fade-up">
            <span className="text-[10px] font-futura tracking-[0.4em] uppercase text-gold/60 mb-6 block">Campaign 2026</span>
            <h1 className="text-6xl md:text-9xl font-display font-black text-ivory uppercase tracking-tighter mb-8 leading-[0.9]">
              The Art<br />
              <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)]">Of Form</span>
            </h1>
          </ScrollReveal>
        </div>

        {/* Editorial Layout */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 space-y-32 md:space-y-48">
          {lookbookImages.map((img, i) => (
            <div key={img.id} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}>
              <div className="w-full md:w-3/5">
                <ScrollReveal variant="fade-up">
                  <div className="aspect-[4/5] bg-noir/50 overflow-hidden relative">
                    <img 
                      src={img.src} 
                      alt={img.title}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                  </div>
                </ScrollReveal>
              </div>
              <div className="w-full md:w-2/5 flex flex-col justify-center">
                <ScrollReveal variant={i % 2 === 0 ? 'fade-left' : 'fade-right'} delay={0.2}>
                  <span className="text-sm font-futura tracking-[0.3em] uppercase text-ivory/30 block mb-4">{img.title}</span>
                  <h2 className="text-4xl md:text-6xl font-display text-ivory italic mb-6">{img.desc}</h2>
                  <p className="text-ivory/50 font-light leading-relaxed max-w-sm">
                    A study in contrasts. Capturing the tension between structured tailoring and fluid, effortless movement. 
                  </p>
                </ScrollReveal>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default LookbookPage;
