import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const dresses = [
  {
    id: 1,
    title: 'Aliza Beauty',
    image: encodeURI('/Glamour dresses/Alizabeauty.jpg'),
    direction: -1 // Slides from left
  },
  {
    id: 2,
    title: 'Isabella',
    image: encodeURI('/Glamour dresses/Isabella 🥰.jpg'),
    direction: 1 // Slides from right
  },
  {
    id: 3,
    title: 'Jennie Edit',
    image: encodeURI("/Glamour dresses/Jennie in a black short tight dress  (It's Ai generated).jpg"),
    direction: -1
  },
  {
    id: 4,
    title: 'Solid Ribbed',
    image: encodeURI('/Glamour dresses/download_(49).jpg'),
    direction: 1
  },
  {
    id: 5,
    title: 'Classic Drop',
    image: encodeURI('/Glamour dresses/download (31).jpg'),
    direction: -1
  },
  {
    id: 6,
    title: 'Modern Drape',
    image: encodeURI('/Glamour dresses/download (39).jpg'),
    direction: 1
  },
  {
    id: 7,
    title: 'Evening Silhouette',
    image: encodeURI('/Glamour dresses/download (44).jpg'),
    direction: -1
  },
  {
    id: 8,
    title: 'Noir Essential',
    image: encodeURI('/Glamour dresses/download (45).jpg'),
    direction: 1
  },
  {
    id: 9,
    title: 'Midnight Velvet',
    image: encodeURI('/Glamour dresses/download (46).jpg'),
    direction: -1
  },
  {
    id: 10,
    title: 'Elegance Redefined',
    image: encodeURI('/Glamour dresses/download (47).jpg'),
    direction: 1
  },
  {
    id: 11,
    title: 'Silken Shadows',
    image: encodeURI('/Glamour dresses/download (48).jpg'),
    direction: -1
  },
  {
    id: 12,
    title: 'The Elesene Edit',
    image: encodeURI('/Glamour dresses/download (49).jpg'),
    direction: 1
  }
];

const DressCard = ({ dress, index }) => {
  const cardRef = useRef(null);
  
  // Track this specific card's position in the viewport
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['0 1', '0.5 0.5'] // Starts when top of card hits bottom of screen, ends when center hits center
  });

  // Calculate slide from side and opacity based on scroll
  const x = useTransform(scrollYProgress, [0, 1], [dress.direction * 150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Floating animation setup (randomize duration slightly so they don't float perfectly in sync)
  const floatDuration = 4 + (index * 0.7);

  return (
    <motion.div
      ref={cardRef}
      style={{ x, opacity }}
      className={`flex w-full ${index % 2 !== 0 ? 'md:mt-8' : ''}`} // Reduced staggered masonry look
    >
      {/* Floating Image Container as Card */}
      <motion.div 
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
        className="w-full relative group overflow-hidden bg-[#111] rounded-2xl shadow-2xl"
      >
        <div className="aspect-[3/5] relative overflow-hidden rounded-2xl">
          <motion.img
            src={dress.image}
            alt={dress.title}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Elegant overlay for the noir aesthetic */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
};

const GlamourDressesSection = () => {
  return (
    <section className="py-32 md:py-44 px-8 md:px-16 max-w-[1400px] mx-auto overflow-hidden">
      {/* Section Header */}
      <div className="mb-24 text-center md:text-left">
        <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/30 block mb-3">
          Curated Selection
        </span>
        <h2 className="text-4xl md:text-6xl font-display font-black text-ivory uppercase tracking-tight">
          Glamour Dresses
        </h2>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6 w-full">
        {dresses.map((dress, i) => (
          <DressCard key={dress.id} dress={dress} index={i} />
        ))}
      </div>
    </section>
  );
};

export default GlamourDressesSection;
