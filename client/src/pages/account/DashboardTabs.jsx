import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { updateUserProfile, changePassword } from '../../api/user';
import useFormValidation from '../../hooks/useFormValidation';

// 1. PAYMENT METHODS TAB
export const PaymentMethodsTab = () => {
  const [cards] = useState([
    {
      id: '1',
      type: 'VISA',
      last4: '4321',
      expiry: '12/28',
      holder: 'Bhagya',
      isPrimary: true,
      bg: 'bg-gradient-to-br from-zinc-800 to-black border-white/[0.08]'
    },
    {
      id: '2',
      type: 'MC',
      last4: '8899',
      expiry: '08/29',
      holder: 'Bhagya',
      isPrimary: false,
      bg: 'bg-gradient-to-br from-[#1c130c] to-[#0d0d0d] border-white/[0.08]'
    }
  ]);

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-ivory tracking-wide">Saved Payment Methods</h2>
        <p className="text-xs text-ivory/60 mt-1 font-futura">Manage your secure credit and debit cards for faster checkout.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className={`p-6 rounded-2xl border text-white relative min-h-[180px] flex flex-col justify-between shadow-lg overflow-hidden ${card.bg}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-futura tracking-[0.2em] opacity-50 uppercase">CREDIT CARD</span>
                <p className="text-sm font-bold mt-1 tracking-wider">•••• •••• •••• {card.last4}</p>
              </div>
              <span className="text-sm font-display font-black tracking-widest">{card.type}</span>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[8px] font-futura tracking-widest opacity-50 block">CARDHOLDER</span>
                <span className="text-xs font-futura tracking-wider uppercase font-semibold mt-0.5 block">{card.holder}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-futura tracking-widest opacity-50 block">EXPIRES</span>
                <span className="text-xs font-futura tracking-wider font-semibold mt-0.5 block">{card.expiry}</span>
              </div>
            </div>

            {card.isPrimary && (
              <span className="absolute top-4 right-4 text-[8px] font-futura tracking-widest bg-gold text-[#0d0d0d] px-2 py-0.5 rounded-full font-bold uppercase select-none">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={() => alert('New cards can be securely added during checkout verification.')}
        className="px-5 py-3 border border-gold/30 hover:border-gold text-gold text-xs font-futura tracking-widest uppercase font-bold rounded-xl bg-transparent transition-all duration-300"
      >
        ADD NEW PAYMENT METHOD
      </button>
    </div>
  );
};

// 2. REWARDS & CLUB TAB
export const RewardsTab = ({ points = 1250 }) => {
  const { user } = useCustomerAuthStore();

  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-ivory tracking-wide">ELESENE VIP Club</h2>
        <p className="text-xs text-ivory/60 mt-1 font-futura">Your point balance, tier status, and member benefits details.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Privilege Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl w-full lg:w-[420px] h-[240px] border border-white/[0.08] p-6 flex flex-col justify-between shadow-xl bg-gradient-to-br from-[#161616] to-[#0c0c0c] text-white shrink-0"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-gold/10 rounded-full blur-[30px] pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-display font-bold tracking-widest">ELESENE</h2>
              <p className="text-[8px] font-futura tracking-[0.25em] uppercase opacity-70">Privilege Card</p>
            </div>
            <span className="text-[8px] font-futura tracking-widest uppercase border border-gold/45 px-2.5 py-0.5 rounded-full font-bold bg-gold/10 text-gold">
              ELITE MEMBER
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-7 rounded bg-white/5 border border-white/10 overflow-hidden relative">
              <div className="absolute inset-x-3 inset-y-1 border-r border-l border-white/10" />
              <div className="absolute inset-y-2 inset-x-1 border-t border-b border-white/10" />
            </div>
            <p className="text-sm font-mono tracking-[0.25em] opacity-80 select-all">
              ELSN {points.toString().padStart(4, '0')} {String(user?.id || 0).padStart(4, '0')} 8923
            </p>
          </div>

          <div className="flex justify-between items-end border-t border-white/10 pt-4">
            <div>
              <p className="text-[7px] font-futura tracking-widest uppercase opacity-70 mb-0.5">Cardholder</p>
              <p className="text-[11px] font-futura tracking-wider uppercase font-semibold truncate max-w-[180px]">
                {user?.full_name || 'Elesene Shopper'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-futura tracking-widest uppercase opacity-70 mb-0.5">Point Balance</p>
              <p className="text-base font-display font-bold">
                {points.toLocaleString()} <span className="text-[9px] font-futura font-light text-gold">pts</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits Breakdown */}
        <div className="flex-grow bg-white border border-black/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <h4 className="text-xs font-futura tracking-widest uppercase font-bold text-ivory">ELITE MEMBERSHIP BENEFITS</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="space-y-1.5 text-left">
              <span className="text-gold text-lg">✦</span>
              <h5 className="text-[10px] font-futura font-bold tracking-wider text-ivory uppercase">5x Point Multiplier</h5>
              <p className="text-[10px] text-ivory/50 font-futura font-light leading-relaxed">Earn points faster on every couture order.</p>
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-gold text-lg">✦</span>
              <h5 className="text-[10px] font-futura font-bold tracking-wider text-ivory uppercase">Priority Dressing</h5>
              <p className="text-[10px] text-ivory/50 font-futura font-light leading-relaxed">Complimentary alterations & direct tailoring.</p>
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-gold text-lg">✦</span>
              <h5 className="text-[10px] font-futura font-bold tracking-wider text-ivory uppercase">Private Showrooms</h5>
              <p className="text-[10px] text-ivory/50 font-futura font-light leading-relaxed">Exclusive access to preview seasonal runways.</p>
            </div>
          </div>

          <p className="text-[9px] font-futura text-ivory/40 mt-4 pt-4 border-t border-black/5 leading-relaxed">
            Points accrued expire after 12 months. Conversion is automatically applied at the checkout pane.
          </p>
        </div>
      </div>
    </div>
  );
};

// 3. NOTIFICATIONS TAB
export const NotificationsTab = () => {
  const [notifications] = useState([
    {
      id: '1',
      title: 'Order Delivered',
      message: 'Your Linen Co-ord Set has been delivered to your saved address. Enjoy your purchase!',
      time: '1 day ago',
      type: 'success',
      icon: (
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '2',
      title: 'Special Insider Offer',
      message: 'Get 15% off on your next Atelier ring purchase using your exclusive member code ATELIER15 at checkout.',
      time: '3 days ago',
      type: 'gold',
      icon: (
        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      )
    },
    {
      id: '3',
      title: 'Concierge Verification',
      message: 'Your phone details were updated successfully.',
      time: '5 days ago',
      type: 'info',
      icon: (
        <svg className="w-4 h-4 text-[#0070D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622" />
        </svg>
      )
    }
  ]);

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-ivory tracking-wide">Shopper Notifications</h2>
        <p className="text-xs text-ivory/60 mt-1 font-futura">Stay updated on your couture deliveries and exclusive club invites.</p>
      </div>

      <div className="space-y-3.5">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 border border-black/5 bg-white rounded-xl flex gap-4 items-start shadow-sm">
            <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-zinc-50 border border-black/5`}>
              {n.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-ivory font-futura">{n.title}</h4>
                <span className="text-[9px] text-ivory/40 font-futura">{n.time}</span>
              </div>
              <p className="text-xs text-ivory/60 leading-relaxed font-futura font-light">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. ACCOUNT SETTINGS (PROFILE EDIT FORM) TAB
export const AccountSettingsTab = () => {
  const { user, updateUser } = useCustomerAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    values,
    setValues,
    errors,
    touched,
    validateForm,
    getFieldProps
  } = useFormValidation(
    {
      full_name: user?.full_name || '',
      phone: user?.phone || ''
    },
    (vals) => {
      const errs = {};
      if (!vals.full_name || !vals.full_name.trim()) errs.full_name = 'Full name is required.';
      return errs;
    }
  );

  const {
    values: pwValues,
    errors: pwErrors,
    touched: pwTouched,
    validateForm: validatePwForm,
    getFieldProps: getPwFieldProps,
    resetForm: resetPwForm
  } = useFormValidation(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    (vals) => {
      const errs = {};
      if (!vals.currentPassword) errs.currentPassword = 'Current password is required.';
      if (!vals.newPassword) errs.newPassword = 'New password is required.';
      else if (vals.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters.';
      if (vals.newPassword !== vals.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
      return errs;
    }
  );

  useEffect(() => {
    if (user) {
      setValues({
        full_name: user.full_name || '',
        phone: user.phone || ''
      });
    }
  }, [user, setValues]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const updatedUser = await updateUserProfile({
        full_name: values.full_name,
        phone: values.phone
      });
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setSuccessMsg('Profile settings updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validatePwForm()) return;

    setLoading(true);

    try {
      await changePassword(pwValues.currentPassword, pwValues.newPassword);
      setSuccessMsg('Password changed successfully.');
      resetPwForm();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-2xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-ivory tracking-wide">Account Settings</h2>
        <p className="text-xs text-ivory/60 mt-1 font-futura">Update your personal information and security preferences.</p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-futura">
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-futura">
          {errorMsg}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-futura tracking-wider text-ivory uppercase font-bold mb-6">Profile Information</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="settings-fullname" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-2 font-bold">Full Name *</label>
              <input 
                type="text"
                {...getFieldProps('full_name', 'settings-fullname')}
                className={`w-full bg-white border rounded-xl px-4 py-3 text-ivory text-xs font-futura focus:outline-none focus:border-gold ${
                  errors.full_name && touched.full_name ? 'border-red-500' : 'border-black/10'
                }`}
              />
              {errors.full_name && touched.full_name && (
                <p id="settings-fullname-error" className="text-[10px] font-futura text-red-500 mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="settings-phone" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-2 font-bold">Phone Number</label>
              <input 
                type="tel"
                {...getFieldProps('phone', 'settings-phone')}
                placeholder="+91 98765 43210"
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-ivory text-xs font-futura placeholder:text-ivory/40 focus:outline-none focus:border-gold transition-colors duration-300"
              />
            </div>

            <div>
              <label htmlFor="settings-email" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-2 font-bold">Email Address</label>
              <input 
                id="settings-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#FAF9F6]/50 border border-black/5 rounded-xl px-4 py-3 text-ivory/50 text-xs font-futura cursor-not-allowed opacity-70"
              />
              <p className="mt-2 text-[10px] font-futura text-ivory/40">Email address cannot be changed. Contact concierge for assistance.</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-ivory border border-ivory text-white font-futura font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-gold hover:border-gold hover:text-noir transition-all duration-300 disabled:opacity-50 shadow-md cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-futura tracking-wider text-ivory uppercase font-bold mb-6">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-2 font-bold">Current Password *</label>
              <div className="relative">
                <input 
                  type={showCurrentPw ? "text" : "password"}
                  {...getPwFieldProps('currentPassword', 'current-password')}
                  className={`w-full bg-white border rounded-xl px-4 py-3 pr-10 text-ivory text-xs font-futura focus:outline-none focus:border-gold ${
                    pwErrors.currentPassword && pwTouched.currentPassword ? 'border-red-500' : 'border-black/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-3 text-ivory/50 hover:text-gold transition-colors focus:outline-none"
                  aria-label={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {pwErrors.currentPassword && pwTouched.currentPassword && (
                <p id="current-password-error" className="text-[10px] font-futura text-red-500 mt-1">{pwErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="new-password" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-2 font-bold">New Password *</label>
              <div className="relative">
                <input 
                  type={showNewPw ? "text" : "password"}
                  {...getPwFieldProps('newPassword', 'new-password')}
                  className={`w-full bg-white border rounded-xl px-4 py-3 pr-10 text-ivory text-xs font-futura focus:outline-none focus:border-gold ${
                    pwErrors.newPassword && pwTouched.newPassword ? 'border-red-500' : 'border-black/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-3 text-ivory/50 hover:text-gold transition-colors focus:outline-none"
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {pwErrors.newPassword && pwTouched.newPassword && (
                <p id="new-password-error" className="text-[10px] font-futura text-red-500 mt-1">{pwErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-2 font-bold">Confirm New Password *</label>
              <div className="relative">
                <input 
                  type={showConfirmPw ? "text" : "password"}
                  {...getPwFieldProps('confirmPassword', 'confirm-new-password')}
                  className={`w-full bg-white border rounded-xl px-4 py-3 pr-10 text-ivory text-xs font-futura focus:outline-none focus:border-gold ${
                    pwErrors.confirmPassword && pwTouched.confirmPassword ? 'border-red-500' : 'border-black/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-3 text-ivory/50 hover:text-gold transition-colors focus:outline-none"
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {pwErrors.confirmPassword && pwTouched.confirmPassword && (
                <p id="confirm-new-password-error" className="text-[10px] font-futura text-red-500 mt-1">{pwErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-ivory border border-ivory text-white font-futura font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-gold hover:border-gold hover:text-noir transition-all duration-300 disabled:opacity-50 shadow-md cursor-pointer"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
