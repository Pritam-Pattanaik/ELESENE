import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/layout/CartDrawer';
import CustomCursor from '../../components/effects/CustomCursor';
import SEO from '../../components/layout/SEO';

const NotFoundPage = () => {
  return (
    <div className="bg-noir min-h-screen selection:bg-gold/40 selection:text-white flex flex-col justify-between">
      <SEO title="Page Not Found | ELESENE" description="The page you are looking for does not exist in our atelier." />
      <CustomCursor />
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5 text-gold">
              <svg className="w-10 h-10 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <span className="text-xs font-futura tracking-[0.3em] uppercase text-gold">
              Error 404 — Atelier Misplaced
            </span>
            <h1 className="text-4xl sm:text-6xl font-display text-ivory tracking-tight uppercase">
              Page Not Found
            </h1>
            <p className="text-ivory/70 text-base sm:text-lg max-w-md mx-auto font-light leading-relaxed">
              The page or piece you are searching for has been moved, renamed, or never existed in our current collection.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-noir text-xs font-futura uppercase tracking-[0.2em] font-semibold hover:bg-gold-light transition-all duration-300 rounded-none shadow-lg"
            >
              <span>Explore Collection</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 border border-ivory/20 text-ivory text-xs font-futura uppercase tracking-[0.2em] hover:bg-ivory/10 transition-all duration-300 rounded-none"
            >
              <span>Back to Home</span>
            </Link>
          </motion.div>
        </div>
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
};

export default NotFoundPage;
