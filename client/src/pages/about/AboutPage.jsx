import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import SEO from '../../components/layout/SEO';

const AboutPage = () => {
  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-white">
      <SEO title="About Us" description="Discover the story and craftsmanship behind Luxe Femme." />
      <CustomCursor />
      <Navbar />

      <main className="pt-32 md:pt-48 pb-32">
        {/* Header */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 mb-24 md:mb-40">
          <ScrollReveal variant="fade-up">
            <h1 className="text-5xl md:text-8xl font-display font-black text-ivory uppercase tracking-tighter mb-8 max-w-4xl">
              Redefining <span className="text-gold">Modern</span> Luxury.
            </h1>
          </ScrollReveal>
        </div>

        {/* Story Section */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-48">
          <ScrollReveal variant="fade-up">
            <div className="aspect-square bg-noir/50 overflow-hidden rounded-sm relative">
              <img 
                src={encodeURI('/Glamour dresses/download_(49).jpg')} 
                alt="Craftsmanship"
                className="w-full h-full object-cover grayscale opacity-80"
              />
              <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
            </div>
          </ScrollReveal>
          
          <div className="flex flex-col justify-center">
            <ScrollReveal variant="fade-up" delay={0.2}>
              <h2 className="text-3xl md:text-5xl font-display text-ivory mb-8">Our Heritage</h2>
              <div className="space-y-6 text-ivory/60 font-light leading-relaxed text-lg">
                <p>
                  Founded on the principles of timeless elegance and uncompromising quality, LUXE FEMME was created for the woman who appreciates the subtle nuances of true craftsmanship.
                </p>
                <p>
                  Every piece in our collection is thoughtfully designed and meticulously constructed. We believe that luxury is not just about aesthetics, but about the feeling of wearing something that was crafted with intention and respect for the art of tailoring.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Big Quote */}
        <div className="bg-white/[0.02] py-32 md:py-48 my-32">
          <div className="max-w-[1400px] mx-auto px-8 md:px-16 text-center">
            <ScrollReveal variant="fade-up">
              <span className="text-6xl text-gold/30 font-display block mb-8">"</span>
              <p className="text-3xl md:text-6xl font-display text-ivory italic leading-snug max-w-5xl mx-auto">
                Fashion fades, but true style is eternal. We design for the woman who writes her own narrative.
              </p>
            </ScrollReveal>
          </div>
        </div>

      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default AboutPage;
