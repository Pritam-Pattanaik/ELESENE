import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/imageUrl';

const ProductImagePlaceholder = () => (
  <div className="w-full h-full bg-[#F5F2ED] flex flex-col items-center justify-center border border-black/5 p-8 text-center select-none">
    <div className="w-14 h-14 rounded-full border border-[#9E8B6D]/30 flex items-center justify-center mb-3 bg-[#9E8B6D]/5">
      <span className="font-display text-[#9E8B6D] text-xl italic">E</span>
    </div>
    <span className="text-xs font-display tracking-[0.3em] uppercase text-[#1A1A1A] font-bold mb-1">ELESENE</span>
    <span className="text-[9px] font-futura tracking-[0.2em] uppercase text-[#9E8B6D]">Luxury Atelier</span>
  </div>
);

const ProductImageGallery = ({ images = [], productName = 'Product' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = images?.length > 0 ? images : [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 h-[480px] md:h-[680px]">
        {/* Thumbnails Column */}
        {displayImages.length > 0 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 shrink-0 [scrollbar-width:none] relative">
            {displayImages.map((img, idx) => {
              const thumbUrl = getImageUrl(img.image_url);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View ${productName} image ${idx + 1}`}
                  className={`w-16 md:w-full aspect-[3/4] flex-shrink-0 overflow-hidden transition-all duration-300 rounded-sm relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9E8B6D] cursor-pointer ${
                    currentIndex === idx 
                      ? 'border-2 border-[#1A1A1A] opacity-100 shadow-sm' 
                      : 'border border-black/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  {thumbUrl ? (
                    <img 
                      src={thumbUrl} 
                      alt={`${productName} view ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <ProductImagePlaceholder />
                  )}
                </button>
              );
            })}

            {displayImages.length > 4 && (
              <div className="hidden md:flex justify-center pt-1 text-black/40">
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Main Image Container */}
        <div className="flex-1 bg-[#FAF8F5] border border-black/5 relative overflow-hidden group rounded-sm select-none">
          {displayImages.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={getImageUrl(displayImages[currentIndex]?.image_url)}
                alt={`${productName} primary view ${currentIndex + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </AnimatePresence>
          ) : (
            <ProductImagePlaceholder />
          )}

          {/* Top-Right Expand Button */}
          {displayImages.length > 0 && (
            <button
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Expand image"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-all duration-300 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15m-11.25 5.25h4.5m-4.5 0v-4.5m0 4.5L9 15" />
              </svg>
            </button>
          )}

          {/* Bottom-Left Counter Overlay (01 / 06) */}
          {displayImages.length > 0 && (
            <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[11px] font-futura tracking-[0.2em] font-medium rounded-full">
              {String(currentIndex + 1).padStart(2, '0')} / {String(displayImages.length).padStart(2, '0')}
            </div>
          )}

          {/* Bottom-Right Prev/Next Arrows */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous image"
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-all duration-300 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next image"
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-all duration-300 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && displayImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white text-2xl font-bold p-2 z-50 cursor-pointer"
              aria-label="Close fullscreen view"
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={getImageUrl(displayImages[currentIndex]?.image_url)}
              alt={`${productName} fullscreen`}
              className="max-w-full max-h-[90vh] object-contain rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageGallery;
