import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from '../../api/products';
import useCartStore from '../../store/cartStore';
import useUiStore from '../../store/uiStore';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import MagneticButton from '../../components/effects/MagneticButton';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ColorSwatch from '../../components/product/ColorSwatch';
import SEO from '../../components/layout/SEO';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { data, isLoading, error } = useProduct(slug || 'mock-slug');
  
  const { addToCartOptimistic } = useCartStore();
  const { openCart } = useUiStore();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const product = data?.product;

  const displayProduct = product || {
    id: 1,
    name: 'Noir Velvet Evening Gown',
    brand: 'ELESENE',
    base_price: '12499',
    description: 'A masterpiece of evening wear. This floor-length gown features a daring thigh-high slit and a subtle cowl neckline, crafted from our signature stretch velvet that drapes beautifully.',
    images: [
      { image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000' },
      { image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000' },
      { image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000' },
    ],
    variants: [
      { id: 101, color: 'Noir', size: 'XS', stock_quantity: 5, additional_price: 0 },
      { id: 102, color: 'Noir', size: 'S', stock_quantity: 10, additional_price: 0 },
      { id: 103, color: 'Noir', size: 'M', stock_quantity: 12, additional_price: 0 },
      { id: 104, color: 'Crimson', size: 'S', stock_quantity: 3, additional_price: 500 },
    ]
  };

  const availableColors = [...new Set(displayProduct.variants.map(v => v.color))];
  const availableSizesForColor = displayProduct.variants.filter(v => v.color === selectedColor).map(v => v.size);

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    const variant = displayProduct.variants.find(v => v.color === selectedColor && v.size === selectedSize);
    addToCartOptimistic(displayProduct, variant, 1);
    openCart();
  };

  if (isLoading) return (
    <div className="h-screen bg-noir flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border border-gold/30 border-t-gold rounded-full animate-spin" />
        <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/30">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-noir min-h-screen">
      <SEO 
        title={displayProduct.name}
        description={displayProduct.description.substring(0, 150) + '...'}
        image={displayProduct.images?.[0]?.image_url}
      />
      <CustomCursor />
      <Navbar />
      
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        {/* Left Column: Image Gallery */}
        <ScrollReveal variant="fade-left" duration={1}>
          <div className="md:sticky md:top-28 self-start">
            <ProductImageGallery images={displayProduct.images} />
          </div>
        </ScrollReveal>

        {/* Right Column: Product Details */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col space-y-8 pt-6"
        >
          <div className="space-y-4 border-b border-white/[0.06] pb-8">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[10px] font-futura uppercase tracking-[0.4em] text-gold/60 block"
            >
              {displayProduct.brand}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl font-display text-ivory uppercase tracking-wide leading-tight"
            >
              {displayProduct.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-2xl font-futura font-light text-gold"
            >
              ₹{Number(displayProduct.base_price).toLocaleString()}
            </motion.p>
          </div>

          <ScrollReveal variant="fade-up" delay={0.1}>
            <div className="text-ivory/40 font-light leading-relaxed text-sm">
              <p>{displayProduct.description}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.2}>
            <div className="space-y-8 pt-4">
              <ColorSwatch 
                colors={availableColors} 
                selectedColor={selectedColor} 
                onSelect={(c) => { setSelectedColor(c); setSelectedSize(null); }} 
              />

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/60">Size</span>
                  <button className="text-[10px] font-futura text-gold/60 hover:text-gold uppercase tracking-[0.2em] transition-colors">Size Guide</button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                    const isAvailable = availableSizesForColor.includes(size);
                    const isSelected = selectedSize === size;
                    
                    return (
                      <motion.button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        className={`py-3 text-xs font-futura font-medium tracking-wider transition-all duration-300 rounded-sm ${
                          isSelected 
                            ? 'bg-gold text-noir shadow-lg shadow-gold/20' 
                            : isAvailable 
                              ? 'glass text-ivory/70 hover:text-gold hover:border-gold/30' 
                              : 'bg-white/[0.02] text-ivory/15 cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <MagneticButton strength={0.15}>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={handleAddToCart}
                  className="relative w-full py-5 overflow-hidden group rounded-sm mt-8"
                  data-cursor="ADD"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold" />
                  <span className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Shimmer sweep effect */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative text-noir text-[11px] font-futura font-bold uppercase tracking-[0.3em]">
                    Add to Bag
                  </span>
                </motion.button>
              </MagneticButton>
              
              <p className="text-[10px] text-center text-ivory/25 font-futura tracking-wider">Free shipping on orders over ₹10,000</p>
            </div>
          </ScrollReveal>

          {/* Accordions */}
          <ScrollReveal variant="fade-up" delay={0.3}>
            <div className="border-t border-white/[0.05] mt-12 divide-y divide-white/[0.05]">
              {[
                { title: 'Product Details', content: 'Crafted from premium Italian velvet with a 95% polyester, 5% elastane blend. Features a concealed side zipper, adjustable straps, and a floor-length silhouette with a thigh-high slit.' },
                { title: 'Shipping & Returns', content: 'Free express shipping on orders over ₹10,000. Standard delivery within 3-5 business days. Hassle-free returns within 14 days of delivery.' },
                { title: 'Care Instructions', content: 'Dry clean only. Store in a breathable garment bag. Avoid direct sunlight. Iron on low heat with a pressing cloth.' }
              ].map((tab) => (
                <details key={tab.title} className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none py-5 text-ivory/60 hover:text-gold transition-colors duration-300">
                    <span className="text-[10px] font-futura tracking-[0.3em] uppercase">{tab.title}</span>
                    <span className="transition-transform duration-300 group-open:rotate-45 text-lg leading-none">+</span>
                  </summary>
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-ivory/30 text-sm font-light leading-relaxed pb-5"
                  >
                    {tab.content}
                  </motion.p>
                </details>
              ))}
            </div>
          </ScrollReveal>
        </motion.div>
      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetailPage;
