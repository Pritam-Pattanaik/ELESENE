import { Link } from 'react-router-dom';
import { toHumanReadableError } from '../../utils/errorMapper';

/**
 * Reusable Luxury Error State component with human-readable error mapping,
 * alert badge, concise message, and retry / navigation actions.
 */
const ErrorState = ({
  error,
  context = 'general',
  onRetry,
  className = ''
}) => {
  const { title, message, actionLabel, redirectTo } = toHumanReadableError(error, context);

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 bg-red-500/[0.03] border border-red-500/20 rounded-3xl max-w-xl mx-auto shadow-sm backdrop-blur-sm ${className}`}>
      {/* Alert Icon Badge */}
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-600">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>

      <h3 className="text-xl font-display font-bold text-ivory uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-ivory/70 font-futura text-xs md:text-sm max-w-md leading-relaxed mb-6 font-light">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-ivory text-white hover:bg-gold hover:text-noir text-xs font-futura font-bold uppercase tracking-widest rounded-xl shadow-md transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {actionLabel || 'Retry'}
          </button>
        )}

        {redirectTo && (
          <Link
            to={redirectTo}
            className="px-6 py-2.5 bg-white border border-black/10 text-ivory text-xs font-futura font-bold uppercase tracking-widest rounded-xl hover:border-gold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Continue
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
