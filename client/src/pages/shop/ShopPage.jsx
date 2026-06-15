import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import ScrollReveal from '../../components/effects/ScrollReveal';
import SEO from '../../components/layout/SEO';
import { Link } from 'react-router-dom';

const mockProducts = [
  { id: 1, name: 'Midnight Velvet Gown', price: '$1,200', image: encodeURI('/Glamour dresses/download (46).jpg') },
  { id: 2, name: 'Noir Essential Dress', price: '$850', image: encodeURI('/Glamour dresses/download (45).jpg') },
  { id: 3, name: 'Silken Shadows', price: '$1,400', image: encodeURI('/Glamour dresses/download (48).jpg') },
  { id: 4, name: 'Elegance Redefined', price: '$2,100', image: encodeURI('/Glamour dresses/download (47).jpg') },
  { id: 5, name: 'Classic Drop Top', price: '$450', image: encodeURI('/Glamour dresses/download (31).jpg') },
  { id: 6, name: 'Modern Drape', price: '$920', image: encodeURI('/Glamour dresses/download (39).jpg') },
  { id: 7, name: 'Evening Silhouette', price: '$1,800', image: encodeURI('/Glamour dresses/download (44).jpg') },
  { id: 8, name: 'The Elesene Edit', price: '$3,200', image: encodeURI('/Glamour dresses/download (49).jpg') },
];

const ShopPage = () => {
  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-white">
      <SEO title="Shop Collection" description="Discover our latest curated collections and luxury essentials." />
      <CustomCursor />
      <Navbar />

      <main className="pt-32 md:pt-48 pb-32">
        {/* Header */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 mb-20 md:mb-32 text-center">
          <ScrollReveal variant="fade-up">
            <h1 className="text-5xl md:text-8xl font-display font-black text-ivory uppercase tracking-tighter mb-6">
              The Collection
            </h1>
            <p className="text-ivory/50 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Timeless elegance meets modern sophistication. Explore our highly curated selection of seasonal drops and permanent fixtures.
            </p>
          </ScrollReveal>
        </div>

        {/* Product Grid */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {mockProducts.map((product, i) => (
              <ScrollReveal key={product.id} variant="fade-up" delay={i * 0.1}>
                <Link to="/product/mock-slug" className="group block" data-cursor="VIEW">
                  <div className="aspect-[3/4] bg-noir/50 overflow-hidden relative rounded-sm mb-6">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-colors duration-500" />
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-display text-ivory group-hover:text-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    <span className="text-sm font-futura text-ivory/60 tabular-nums">
                      {product.price}
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ShopPage;
