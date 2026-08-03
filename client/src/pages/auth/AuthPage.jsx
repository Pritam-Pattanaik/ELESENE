import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import useFormValidation from '../../hooks/useFormValidation';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading } = useCustomerAuthStore();

  const initialValues = {
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const validateFn = (vals) => {
    const errs = {};
    if (mode === 'register') {
      if (!vals.full_name || !vals.full_name.trim()) {
        errs.full_name = 'Full name is required.';
      }
      if (vals.password && vals.confirmPassword && vals.password !== vals.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }
    if (!vals.email || !vals.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!vals.password || !vals.password.trim()) {
      errs.password = 'Password is required.';
    } else if (mode === 'register' && vals.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }
    return errs;
  };

  const {
    values,
    errors,
    touched,
    validateForm,
    getFieldProps,
    resetForm
  } = useFormValidation(initialValues, validateFn);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'register') {
        await register(values.full_name.trim(), values.email.trim(), values.password);
      } else {
        await login(values.email.trim(), values.password);
      }
      const fromPath = location.state?.from?.pathname || location.state?.from;
      const params = new URLSearchParams(window.location.search);
      const redirectTo = fromPath || params.get('redirect') || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    resetForm();
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4 sm:px-6 py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Back to home */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 text-ivory/70 hover:text-ivory transition-colors duration-300 flex items-center gap-2 text-sm font-futura tracking-wider font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm inline-block">
            <h1 className="text-3xl font-display font-bold text-ivory tracking-[0.15em]">ELESENE</h1>
          </Link>
          <div className="w-8 h-[1px] bg-gold/40 mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="glass-card glass-shimmer p-6 sm:p-8 md:p-10 shadow-xl">
          {location.state?.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl glass-gold border border-gold/30 text-ivory text-xs font-futura tracking-wider text-center flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{location.state.message}</span>
            </motion.div>
          )}

          {/* Tab switcher */}
          <div className="flex mb-8 border-b border-black/5" role="tablist">
            <button 
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`flex-1 pb-3 text-sm font-futura tracking-[0.15em] uppercase transition-all duration-300 border-b-2 font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                mode === 'login' 
                  ? 'text-gold-light border-gold-light' 
                  : 'text-ivory/70 border-transparent hover:text-ivory'
              }`}
            >
              Sign In
            </button>
            <button 
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
              className={`flex-1 pb-3 text-sm font-futura tracking-[0.15em] uppercase transition-all duration-300 border-b-2 font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                mode === 'register' 
                  ? 'text-gold-light border-gold-light' 
                  : 'text-ivory/70 border-transparent hover:text-ivory'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-futura tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="premium-input-group"
                >
                  <input 
                    type="text"
                    {...getFieldProps('full_name', 'auth-name')}
                    placeholder=" "
                    className={`premium-input ${
                      errors.full_name && touched.full_name ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                    }`}
                  />
                  <label htmlFor="auth-name" className="premium-label">Full Name *</label>
                  {errors.full_name && touched.full_name && (
                    <p id="auth-name-error" className="text-[11px] font-futura text-red-500 mt-1.5">{errors.full_name}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="premium-input-group">
              <input 
                type="email"
                {...getFieldProps('email', 'auth-email')}
                placeholder=" "
                className={`premium-input ${
                  errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                }`}
              />
              <label htmlFor="auth-email" className="premium-label">Email Address *</label>
              {errors.email && touched.email && (
                <p id="auth-email-error" className="text-[11px] font-futura text-red-500 mt-1.5">{errors.email}</p>
              )}
            </div>

            <div className="premium-input-group relative">
              <input 
                type={showPassword ? "text" : "password"}
                {...getFieldProps('password', 'auth-password')}
                placeholder=" "
                className={`premium-input pr-10 ${
                  errors.password && touched.password ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-ivory/50 hover:text-gold transition-colors duration-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <label htmlFor="auth-password" className="premium-label">Password *</label>
              {errors.password && touched.password && (
                <p id="auth-password-error" className="text-[11px] font-futura text-red-500 mt-1.5">{errors.password}</p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="confirm-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="premium-input-group relative"
                >
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    {...getFieldProps('confirmPassword', 'auth-confirm-password')}
                    placeholder=" "
                    className={`premium-input pr-10 ${
                      errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-ivory/50 hover:text-gold transition-colors duration-200 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <label htmlFor="auth-confirm-password" className="premium-label">Confirm Password *</label>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p id="auth-confirm-password-error" className="text-[11px] font-futura text-red-500 mt-1.5">{errors.confirmPassword}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-ivory text-white font-futura text-sm tracking-[0.15em] uppercase font-bold rounded-xl hover:bg-gold hover:text-noir transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-2 shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center mt-6 text-ivory/70 text-xs font-futura font-medium">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="text-gold-light hover:text-gold font-bold transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm px-1">
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-[10px] font-futura text-ivory/70 tracking-wider">
          © {new Date().getFullYear()} ELESENE · Premium Fashion
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
