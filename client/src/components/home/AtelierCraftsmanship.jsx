import ScrollReveal from '../effects/ScrollReveal';

const pillars = [
  {
    id: '01',
    tag: 'FLORENCE, ITALY',
    title: 'Mulberry Silk Faille',
    desc: 'Double-woven organic silk sourced from historic Tuscan mills, offering unyielding structural drape and a luminous satin luster.',
    icon: '🧵'
  },
  {
    id: '02',
    tag: 'BIELLA, ITALY',
    title: 'Loro Piana Cashmere',
    desc: 'Ultra-fine 14-micron cashmere fibers combed exclusively during spring molting to deliver lightweight warmth and cloud softness.',
    icon: '✨'
  },
  {
    id: '03',
    tag: 'PARIS, FRANCE',
    title: 'Architectural Tailoring',
    desc: 'Patterned by master couturiers in Paris using 3D ergonomic draping that contours the female body with effortless poise.',
    icon: '✂️'
  },
  {
    id: '04',
    tag: 'MILAN, ITALY',
    title: '24k Gold Hardware',
    desc: 'Sculpted brass zips, clasps, and buckles electroplated in genuine 24k gold for tarnish-proof heirloom longevity.',
    icon: '👑'
  }
];

const AtelierCraftsmanship = () => {
  return (
    <section id="craftsmanship" className="relative pt-28 pb-6 md:pt-36 md:pb-8 bg-noir border-t border-black/5 overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 md:px-16 relative z-10">
        
        {/* Header */}
        <ScrollReveal variant="fade-up" className="max-w-2xl mb-16">
          <span className="text-[10px] font-futura tracking-[0.4em] uppercase text-gold-light font-bold block mb-3">
            HERITAGE & MATERIALS
          </span>
          <h2 className="text-h2 text-ivory uppercase tracking-wide">
            Atelier <span className="italic text-gold">Craftsmanship</span>
          </h2>
          <p className="text-ivory/70 text-xs md:text-sm font-body font-light mt-4 leading-relaxed">
            Every ELESENE garment represents hundreds of hours of painstaking artisanal dedication, combining old-world European techniques with modern structural precision.
          </p>
        </ScrollReveal>

        {/* 4 Pillar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((item, idx) => (
            <ScrollReveal key={item.id} variant="fade-up" delay={idx * 0.15}>
              <div 
                data-cursor="HERITAGE"
                className="bg-white border border-black/10 rounded-2xl p-8 shadow-lg hover:border-gold/50 hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between h-full relative overflow-hidden"
              >
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-display font-bold text-gold-light tracking-widest">{item.id}</span>
                  </div>

                  <span className="text-[9px] font-futura tracking-[0.3em] text-gold-light font-bold uppercase block mb-2">
                    {item.tag}
                  </span>
                  
                  <h3 className="text-h4 font-bold text-ivory mb-3 group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-ivory/70 font-body font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[9px] font-futura font-bold tracking-widest text-ivory/70 uppercase group-hover:text-gold transition-colors">
                    Guaranteed Origin
                  </span>
                  <span className="text-xs text-gold font-bold transition-transform group-hover:translate-x-1 duration-300">→</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AtelierCraftsmanship;
