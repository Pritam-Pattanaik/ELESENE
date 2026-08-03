import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../effects/ScrollReveal';

const trendingItems = [
  { id: 1, name: 'Silk Slip Dress', price: '₹4,999', tag: 'BESTSELLER', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, name: 'Velvet Evening Gown', price: '₹12,499', tag: 'NEW', img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, name: 'Crystal Embellished Top', price: '₹3,499', tag: 'TRENDING', img: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, name: 'Noir Tailored Suit', price: '₹15,999', tag: 'EXCLUSIVE', img: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, name: 'Pearl Drop Earrings', price: '₹1,299', tag: 'LIMITED', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop' },
];

const TrendingCarousel = () => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, []);

  return (
    <section className="pt-32 pb-8 md:pb-16 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold/[0.02] rounded-full blur-[150px] pointer-events-none" />
      
      <ScrollReveal variant="fade-up" className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-futura tracking-[0.4em] uppercase text-gold/60 block mb-3">
            ◆ CURATED FOR YOU
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-ivory uppercase tracking-wide">
            Trending <span className="italic text-gold">Now</span>
          </h2>
        </div>
        <a href="/" className="hidden md:flex items-center gap-2 text-[10px] font-futura uppercase tracking-[0.3em] text-ivory/40 hover:text-gold transition-colors duration-300 group" data-cursor="VIEW">
          View All
          <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </a>
      </ScrollReveal>

      <motion.div ref={containerRef} className="cursor-grab active:cursor-grabbing pl-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
        <motion.div 
          drag="x" 
          dragConstraints={{ right: 0, left: -width }}
          className="flex gap-6 w-max pr-6"
        >
          {trendingItems.map((item, idx) => (
            <motion.div 
              key={item.id} 
              className="w-72 md:w-80 flex-shrink-0 group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
            >
              <div className="aspect-[3/4] bg-noir overflow-hidden relative rounded-sm" data-cursor="DRAG">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent opacity-60" />
                
                <span className="absolute top-4 left-4 px-3 py-1 text-[8px] font-futura tracking-[0.3em] uppercase glass text-gold rounded-sm">
                  {item.tag}
                </span>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <motion.button 
                    className="glass px-8 py-3 text-[10px] font-futura tracking-[0.3em] uppercase text-ivory hover:text-gold transition-colors duration-300 rounded-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Quick View
                  </motion.button>
                </div>
              </div>
              
              <div className="mt-4 space-y-1.5">
                <h3 className="font-futura font-medium text-ivory/90 text-sm tracking-wide">{item.name}</h3>
                <span className="font-futura text-gold text-sm font-medium">{item.price}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TrendingCarousel;
