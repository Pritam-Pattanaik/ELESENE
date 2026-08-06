import React from 'react';
import { RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 bg-noir/90 text-ivory text-center rounded-2xl border border-white/10 glass-subtle shadow-2xl my-6">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-xl md:text-2xl font-serif font-bold text-ivory tracking-wide mb-2">
            {this.props.title || 'Something went wrong'}
          </h3>

          <p className="text-xs md:text-sm text-ivory/60 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || this.props.description || 'An unexpected rendering error occurred. Please try reloading this section.'}
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-gold hover:bg-gold-light text-noir font-futura text-xs tracking-[0.2em] uppercase font-bold rounded-xl transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>

            <a
              href="/"
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-ivory font-futura text-xs tracking-[0.2em] uppercase font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
