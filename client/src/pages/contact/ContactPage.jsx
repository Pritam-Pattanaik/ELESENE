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
      <SEO title="Contact Us" description="Get in touch with the ELESENE concierge." />
      <CustomCursor />
      <Navbar />

      <main className="pt-32 md:pt-48 pb-32">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
            
            {/* Left Side: Info */}
            <div>
              <ScrollReveal variant="fade-up">
                <h1 className="text-display-hero text-ivory uppercase tracking-tighter mb-8">
                  Get in <br /><span className="text-transparent [-webkit-text-stroke:1.5px_var(--color-ivory)]">Touch</span>
                </h1>
                <p className="text-ivory/70 text-lg font-light leading-relaxed mb-16 max-w-md">
                  For inquiries regarding bespoke orders, styling consultations, or general assistance, our concierge team is at your service.
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold-light font-bold mb-4">Email</h3>
                    <a href="mailto:concierge@elesene.com" className="text-xl font-display text-ivory hover:text-gold transition-colors duration-300 font-bold">
                      concierge@elesene.com
                    </a>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold-light font-bold mb-4">Studio</h3>
                    <p className="text-lg font-display text-ivory/90 leading-relaxed font-bold">
                      124 Heritage Boulevard,<br />
                      London, UK
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold-light font-bold mb-4">Social</h3>
                    <div className="flex gap-6">
                      {['Instagram', 'Pinterest', 'X'].map(social => (
                        <a key={social} href="#" className="text-sm font-futura text-ivory/70 hover:text-gold transition-colors duration-300 font-medium">
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
                    <div className="premium-input-group">
                      <input 
                        type="text" 
                        required
                        id="contact-name"
                        placeholder=" "
                        className="premium-input focus:border-gold"
                      />
                      <label htmlFor="contact-name" className="premium-label">Your Name</label>
                    </div>

                    <div className="premium-input-group">
                      <input 
                        type="email" 
                        required
                        id="contact-email"
                        placeholder=" "
                        className="premium-input focus:border-gold"
                      />
                      <label htmlFor="contact-email" className="premium-label">Email Address</label>
                    </div>

                    <div className="premium-input-group">
                      <select 
                        id="contact-subject"
                        className="premium-input focus:border-gold appearance-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-noir text-ivory/50">Subject of Inquiry</option>
                        <option value="bespoke" className="bg-noir text-ivory">Bespoke Tailoring</option>
                        <option value="styling" className="bg-noir text-ivory">Styling Session</option>
                        <option value="support" className="bg-noir text-ivory">Customer Support</option>
                        <option value="press" className="bg-noir text-ivory">Press / Partnerships</option>
                      </select>
                      <label htmlFor="contact-subject" className="premium-label !top-[-0.75rem] !font-semibold !text-xs !color-gold !tracking-[0.1em]">Subject of Inquiry</label>
                    </div>

                    <div className="premium-input-group">
                      <textarea 
                        required
                        id="contact-message"
                        rows={4}
                        placeholder=" "
                        className="premium-input focus:border-gold resize-none"
                      />
                      <label htmlFor="contact-message" className="premium-label">Your Message</label>
                    </div>

                  <div className="pt-8">
                    <MagneticButton strength={0.3}>
                      <button 
                        type="submit"
                        className="inline-flex items-center gap-4 px-10 py-4 bg-ivory text-white hover:bg-gold hover:text-noir text-[11px] font-futura font-bold uppercase tracking-[0.2em] transition-colors duration-500 w-full md:w-auto justify-center rounded-lg shadow-md cursor-pointer"
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
