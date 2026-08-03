import { Link } from 'react-router-dom';

/**
 * Reusable Branded Empty State component with gold badge icon,
 * luxury Playfair typography, glassmorphism card styling, and CTA actions.
 */
const EmptyState = ({
  icon,
  title,
  description,
  primaryAction, // { label: string, onClick?: fn, to?: string, icon?: node }
  secondaryAction, // { label: string, onClick?: fn, to?: string }
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 sm:px-8 glass-card shadow-sm max-w-2xl mx-auto glass-shimmer ${className}`}>
      {/* Branded Gold Badge Icon */}
      {icon && (
        <div className="w-16 h-16 rounded-full glass-gold border border-gold/25 flex items-center justify-center mb-6 text-gold shadow-sm">
          {icon}
        </div>
      )}

      {/* Typography */}
      <h3 className="text-2xl font-display font-bold text-ivory uppercase tracking-wide mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-ivory/70 font-futura text-xs md:text-sm max-w-md leading-relaxed mb-8 font-light">
          {description}
        </p>
      )}

      {/* Action CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {primaryAction && (
          primaryAction.to ? (
            <Link
              to={primaryAction.to}
              className="px-8 py-3.5 bg-ivory text-white hover:bg-gold hover:text-noir text-xs font-futura font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Link>
          ) : (
            <button
              onClick={primaryAction.onClick}
              className="px-8 py-3.5 bg-ivory text-white hover:bg-gold hover:text-noir text-xs font-futura font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )
        )}

        {secondaryAction && (
          secondaryAction.to ? (
            <Link
              to={secondaryAction.to}
              className="px-6 py-3.5 glass-subtle border border-black/10 text-ivory/80 hover:text-gold hover:border-gold/30 text-xs font-futura font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {secondaryAction.label}
            </Link>
          ) : (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3.5 glass-subtle border border-black/10 text-ivory/80 hover:text-gold hover:border-gold/30 text-xs font-futura font-bold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {secondaryAction.label}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default EmptyState;
