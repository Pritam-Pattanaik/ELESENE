import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images?.length > 0 ? images : [
    { image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000' }
  ];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 h-[500px] md:h-[750px]">
      
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-20 shrink-0" style={{ scrollbarWidth: 'none' }}>
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-16 md:w-full aspect-[3/4] flex-shrink-0 overflow-hidden transition-all duration-500 rounded-sm relative ${
              currentIndex === idx 
                ? 'opacity-100' 
                : 'opacity-30 hover:opacity-60'
            }`}
          >
            <img 
              src={img.image_url.startsWith('http') ? img.image_url : `http://localhost:3000${img.image_url}`} 
              alt={`Thumbnail ${idx + 1}`} 
              className="w-full h-full object-cover"
            />
            {currentIndex === idx && (
              <motion.div layoutId="thumb-indicator" className="absolute inset-0 border border-gold/50 rounded-sm pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 bg-white/[0.02] relative overflow-hidden group rounded-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            src={displayImages[currentIndex].image_url.startsWith('http') ? displayImages[currentIndex].image_url : `http://localhost:3000${displayImages[currentIndex].image_url}`}
            alt="Main product"
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </div>
  );
};

export default ProductImageGallery;
