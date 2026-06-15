import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register, loading } = useCustomerAuthStore();

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!form.full_name.trim()) return setError('Please enter your full name');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match');
      if (form.password.length < 6) return setError('Password must be at least 6 characters');
    }

    if (!form.email.trim() || !form.password.trim()) return setError('Email and password are required');

    try {
      if (mode === 'register') {
        await register(form.full_name.trim(), form.email.trim(), form.password);
      } else {
        await login(form.email.trim(), form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Back to home */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 text-ivory/30 hover:text-ivory/60 transition-colors duration-300 flex items-center gap-2 text-sm font-futura tracking-wider"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          <Link to="/">
            <h1 className="text-3xl font-display font-bold text-ivory tracking-[0.15em]">ELESENE</h1>
          </Link>
          <div className="w-8 h-[1px] bg-gold/40 mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10 backdrop-blur-sm">
          {/* Tab switcher */}
          <div className="flex mb-8 border-b border-white/[0.06]">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-futura tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                mode === 'login' 
                  ? 'text-gold border-gold' 
                  : 'text-ivory/30 border-transparent hover:text-ivory/50'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-futura tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                mode === 'register' 
                  ? 'text-gold border-gold' 
                  : 'text-ivory/30 border-transparent hover:text-ivory/50'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-futura"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Full Name</label>
                  <input 
                    type="text"
                    value={form.full_name}
                    onChange={e => handleChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura placeholder:text-ivory/15 focus:outline-none focus:border-gold/30 transition-colors duration-300"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Email Address</label>
              <input 
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura placeholder:text-ivory/15 focus:outline-none focus:border-gold/30 transition-colors duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Password</label>
              <input 
                type="password"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura placeholder:text-ivory/15 focus:outline-none focus:border-gold/30 transition-colors duration-300"
                required
              />
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="confirm-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Confirm Password</label>
                  <input 
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura placeholder:text-ivory/15 focus:outline-none focus:border-gold/30 transition-colors duration-300"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold text-noir font-futura text-sm tracking-[0.15em] uppercase rounded-lg hover:bg-gold-light transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
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
          <p className="text-center mt-6 text-ivory/25 text-xs font-futura">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={switchMode} className="text-gold/70 hover:text-gold transition-colors duration-300">
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-[10px] font-futura text-ivory/15 tracking-wider">
          © {new Date().getFullYear()} ELESENE · Premium Fashion
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
