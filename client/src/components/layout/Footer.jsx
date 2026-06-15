import { Link } from 'react-router-dom';
import ScrollReveal from '../effects/ScrollReveal';

const Footer = () => {
  return (
    <footer className="relative bg-noir pt-32 pb-12 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10">
        {/* Big CTA heading */}
        <ScrollReveal variant="fade-up">
          <div className="mb-24">
            <h2 className="text-4xl md:text-7xl font-display font-black text-ivory uppercase tracking-tight leading-[1.05] max-w-3xl mb-10">
              Ready to elevate your wardrobe?
            </h2>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/product/mock-slug" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-ivory text-noir text-[11px] font-futura font-semibold uppercase tracking-[0.15em] rounded-full hover:bg-gold transition-all duration-500"
              >
                Shop Now
              </a>
              <a 
                href="mailto:hello@elesene.in" 
                className="inline-flex items-center gap-3 px-8 py-4 border border-white/[0.1] text-ivory text-[11px] font-futura font-medium uppercase tracking-[0.15em] rounded-full hover:border-gold/40 hover:text-gold transition-all duration-500"
              >
                Write to us
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-20 pt-12 border-t border-white/[0.05]">
          <ScrollReveal variant="fade-up" delay={0}>
            <div>
              <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase mb-6 text-ivory/30">Explore</h3>
              <ul className="space-y-3 text-sm text-ivory/40">
                {['New Arrivals', 'Collections', 'Lookbook', 'Bridal'].map(item => (
                  <li key={item}>
                    <Link to="/" className="hover:text-ivory transition-colors duration-300 font-light">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.08}>
            <div>
              <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase mb-6 text-ivory/30">Help</h3>
              <ul className="space-y-3 text-sm text-ivory/40">
                {['Size Guide', 'Shipping', 'Returns', 'FAQ'].map(item => (
                  <li key={item}>
                    <Link to="/" className="hover:text-ivory transition-colors duration-300 font-light">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.16}>
            <div>
              <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase mb-6 text-ivory/30">Social</h3>
              <ul className="space-y-3 text-sm text-ivory/40">
                {['Instagram', 'Pinterest', 'X', 'LinkedIn'].map(item => (
                  <li key={item}>
                    <a href="#" className="hover:text-ivory transition-colors duration-300 font-light">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.24}>
            <div>
              <h3 className="text-[10px] font-futura tracking-[0.3em] uppercase mb-6 text-ivory/30">Newsletter</h3>
              <p className="text-sm mb-5 text-ivory/30 font-light">Exclusive drops and styling tips.</p>
              <form className="flex overflow-hidden rounded-full border border-white/[0.08] focus-within:border-gold/30 transition-colors">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-transparent px-5 py-3 text-sm w-full text-ivory placeholder:text-ivory/15 focus:outline-none font-light"
                />
                <button 
                  type="button" 
                  className="bg-ivory/10 hover:bg-gold text-ivory hover:text-noir px-5 font-futura font-semibold uppercase text-[10px] tracking-[0.1em] transition-all duration-300 whitespace-nowrap"
                >
                  →
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-ivory/15 font-futura tracking-wider">
          <p>© {new Date().getFullYear()} ELESENE · London, UK</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-ivory/40 transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-ivory/40 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
