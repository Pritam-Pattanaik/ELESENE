import ScrollReveal from '../effects/ScrollReveal';

const designers = [
  {
    id: 1,
    name: 'Elena Rostova',
    role: 'Creative Director',
    bio: 'Pioneering minimalist form, Elena brings 15 years of Milanese draping heritage to ELESENE, tailoring pieces that embrace fluidity and grace.',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Siddharth Mehta',
    role: 'Head of Couture',
    bio: 'Merging hand-woven textiles with contemporary patterns, Siddharth crafts ELESENE\'s signature eveningwear and luxury silk bridal gowns.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Clara Dupont',
    role: 'Textiles & Sustainability',
    bio: 'Dedicated to fluid structures, Clara leads our linen and organic cotton resort lines, focusing on sustainable dyeing methods and premium threads.',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop'
  }
];

const DesignersSection = () => {
  return (
    <section id="designers-showcase" className="bg-noir pt-6 pb-28 md:pt-8 md:pb-36 px-6 md:px-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gold/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="text-center mb-20">
          <span className="text-[10px] font-sans tracking-[0.35em] uppercase text-gold/60 block mb-3">
            The Creative Minds
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-ivory tracking-wide uppercase">
            Meet Our <span className="italic text-gold">Designers</span>
          </h2>
          <div className="w-12 h-[1px] bg-gold/30 mx-auto mt-6" />
        </ScrollReveal>

        {/* Designers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {designers.map((designer, idx) => (
            <ScrollReveal 
              key={designer.id} 
              variant="fade-up" 
              delay={idx * 0.1}
            >
              <div className="group flex flex-col items-center text-center">
                
                {/* Designer Image Card */}
                <div className="w-64 h-80 rounded-2xl overflow-hidden relative border border-black/10 shadow-md mb-8 group-hover:border-gold/30 transition-colors duration-500 bg-white">
                  <img 
                    src={designer.img} 
                    alt={designer.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent opacity-60" />
                </div>

                {/* Designer Description */}
                <div className="space-y-3.5 max-w-xs">
                  <div>
                    <h3 className="font-serif text-2xl text-ivory tracking-wide group-hover:text-gold transition-colors duration-300">
                      {designer.name}
                    </h3>
                    <span className="text-[9.5px] font-sans tracking-[0.2em] uppercase text-gold-light block mt-1.5 font-semibold">
                      {designer.role}
                    </span>
                  </div>
                  <p className="text-ivory/70 text-xs md:text-sm font-sans font-light leading-relaxed">
                    {designer.bio}
                  </p>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DesignersSection;
