import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import SEO from '../../components/layout/SEO';
import MagneticButton from '../../components/effects/MagneticButton';

const ContactPage = () => {
  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-white">
      <SEO title="Contact Us" description="Get in touch with the Luxe Femme concierge." />
      <CustomCursor />
      <Navbar />

      <main className="pt-32 md:pt-48 pb-32">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
            
            {/* Left Side: Info */}
            <div>
              <ScrollReveal variant="fade-up">
                <h1 className="text-5xl md:text-8xl font-display font-black text-ivory uppercase tracking-tighter mb-8">
                  Get in <br /><span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)]">Touch</span>
                </h1>
                <p className="text-ivory/50 text-lg font-light leading-relaxed mb-16 max-w-md">
                  For inquiries regarding bespoke orders, styling consultations, or general assistance, our concierge team is at your service.
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold/60 mb-4">Email</h3>
                    <a href="mailto:concierge@luxefemme.in" className="text-xl font-display text-ivory hover:text-gold transition-colors duration-300">
                      concierge@luxefemme.in
                    </a>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold/60 mb-4">Studio</h3>
                    <p className="text-lg font-display text-ivory/80 leading-relaxed">
                      124 Heritage Boulevard,<br />
                      London, UK
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold/60 mb-4">Social</h3>
                    <div className="flex gap-6">
                      {['Instagram', 'Pinterest', 'X'].map(social => (
                        <a key={social} href="#" className="text-sm font-futura text-ivory/50 hover:text-gold transition-colors duration-300">
                          {social}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Side: Form */}
            <div className="lg:pt-24">
              <ScrollReveal variant="fade-up" delay={0.2}>
                <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative group/input">
                    <input 
                      type="text" 
                      required
                      placeholder="Your Name"
                      className="w-full bg-transparent border-b border-white/10 py-4 text-ivory font-light focus:outline-none focus:border-gold transition-colors peer"
                    />
                  </div>
                  <div className="relative group/input">
                    <input 
                      type="email" 
                      required
                      placeholder="Email Address"
                      className="w-full bg-transparent border-b border-white/10 py-4 text-ivory font-light focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="relative group/input">
                    <select 
                      className="w-full bg-transparent border-b border-white/10 py-4 text-ivory font-light focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled className="bg-noir text-ivory/50">Subject of Inquiry</option>
                      <option value="bespoke" className="bg-noir">Bespoke Tailoring</option>
                      <option value="styling" className="bg-noir">Styling Session</option>
                      <option value="support" className="bg-noir">Customer Support</option>
                      <option value="press" className="bg-noir">Press / Partnerships</option>
                    </select>
                  </div>
                  <div className="relative group/input">
                    <textarea 
                      required
                      rows={4}
                      placeholder="Your Message"
                      className="w-full bg-transparent border-b border-white/10 py-4 text-ivory font-light focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-8">
                    <MagneticButton strength={0.3}>
                      <button 
                        type="submit"
                        className="inline-flex items-center gap-4 px-10 py-4 bg-ivory text-noir text-[11px] font-futura font-medium uppercase tracking-[0.2em] hover:bg-gold transition-colors duration-500 w-full md:w-auto justify-center"
                      >
                        Send Inquiry
                      </button>
                    </MagneticButton>
                  </div>
                </form>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ContactPage;
