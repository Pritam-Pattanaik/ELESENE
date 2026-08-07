import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { updateUserProfile, changePassword } from '../../api/user';
import useFormValidation from '../../hooks/useFormValidation';

/* ─── Shared field components ─────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">
    {children}
  </span>
);

const FieldInput = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-xs font-futura focus:outline-none focus:ring-1 focus:ring-[#B99246] focus:border-[#B99246] transition-all duration-200 placeholder:text-[#6F6F6F]/50 ${
      error ? 'border-red-400 bg-red-50/30' : 'border-[#ECE8E1]'
    }`}
  />
);

const SectionCard = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-[#ECE8E1] overflow-hidden ${className}`}
    style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="px-6 py-5 border-b border-[#ECE8E1]">
    <h3 className="text-sm font-display font-semibold text-[#141414] tracking-wide">{title}</h3>
    {subtitle && <p className="text-[10px] text-[#6F6F6F] mt-1 font-futura">{subtitle}</p>}
  </div>
);

const EyeIcon = ({ show }) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {show
      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      : <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
    }
  </svg>
);

const PwField = ({ id, label, show, onToggle, fieldProps, error, touched: t }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        {...fieldProps}
        className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 pr-11 text-[#141414] text-xs font-futura focus:outline-none focus:ring-1 focus:ring-[#B99246] focus:border-[#B99246] transition-all duration-200 ${
          error && t ? 'border-red-400 bg-red-50/30' : 'border-[#ECE8E1]'
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-3 text-[#6F6F6F] hover:text-[#B99246] transition-colors focus:outline-none cursor-pointer"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <EyeIcon show={show} />
      </button>
    </div>
    {error && t && <p className="text-[10px] font-futura text-red-500 mt-1.5">{error}</p>}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* 1. PAYMENT METHODS TAB                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
export const PaymentMethodsTab = () => {
  const [cards] = useState([
    {
      id: '1',
      type: 'VISA',
      last4: '4321',
      expiry: '12/28',
      holder: 'BHAGYA',
      isPrimary: true,
      gradient: 'from-[#141414] via-[#1E1E1E] to-[#0A0A0A]',
    },
    {
      id: '2',
      type: 'MC',
      last4: '8899',
      expiry: '08/29',
      holder: 'BHAGYA',
      isPrimary: false,
      gradient: 'from-[#1C130C] via-[#2A1D12] to-[#0D0D0D]',
    },
  ]);

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-[#141414] tracking-wide">Saved Payment Methods</h2>
        <p className="text-xs text-[#6F6F6F] mt-1 font-futura">Manage your secure credit and debit cards for faster checkout.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative min-h-[190px] rounded-2xl p-6 flex flex-col justify-between text-white overflow-hidden bg-gradient-to-br ${card.gradient}`}
            style={{ boxShadow: '0 12px 40px rgba(0,0,0,.22)' }}
          >
            {/* Card grain texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] pointer-events-none" />
            {/* Subtle gold glow top-right */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#B99246]/8 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-futura tracking-[0.2em] text-white/40 uppercase">Credit Card</span>
                <p className="text-sm font-mono tracking-[0.2em] text-white/90 mt-2">•••• •••• •••• {card.last4}</p>
              </div>
              <span className="text-base font-display font-black tracking-widest text-white/80">{card.type}</span>
            </div>

            <div className="relative z-10">
              {/* Chip */}
              <div className="w-8 h-6 rounded bg-white/10 border border-white/15 mb-4 flex items-center justify-center">
                <div className="w-5 h-3.5 rounded-sm border border-white/10 grid grid-cols-2 gap-px overflow-hidden opacity-60">
                  <div className="bg-white/10" /><div className="bg-white/5" />
                  <div className="bg-white/5" /><div className="bg-white/10" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[7px] font-futura tracking-widest text-white/40 uppercase block">Cardholder</span>
                  <span className="text-xs font-futura tracking-wider text-white/80 font-semibold block mt-0.5">{card.holder}</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-futura tracking-widest text-white/40 uppercase block">Expires</span>
                  <span className="text-xs font-futura tracking-wider text-white/80 font-semibold block mt-0.5">{card.expiry}</span>
                </div>
              </div>
            </div>

            {card.isPrimary && (
              <span className="absolute top-4 right-4 text-[7px] font-futura tracking-widest bg-[#B99246] text-[#0F0F10] px-2 py-0.5 rounded-full font-bold uppercase select-none z-20">
                Primary
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => alert('New cards can be securely added during checkout verification.')}
        className="inline-flex items-center gap-2 px-5 py-3 border border-[#ECE8E1] hover:border-[#B99246] text-[#141414] hover:text-[#B99246] text-xs font-futura tracking-widest uppercase font-bold rounded-xl bg-white transition-all duration-200 cursor-pointer"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add New Payment Method
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 2. REWARDS & CLUB TAB                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export const RewardsTab = ({ points = 1250 }) => {
  const { user } = useCustomerAuthStore();
  const tier = user?.investmentTier || 'Seed';

  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-[#141414] tracking-wide">ELESENE VIP Club</h2>
        <p className="text-xs text-[#6F6F6F] mt-1 font-futura">Your point balance, tier status, and member benefits.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">

        {/* ── Privilege Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl w-full lg:w-[420px] min-h-[240px] bg-[#0F0F10] text-white p-6 flex flex-col justify-between shrink-0"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,.22)' }}
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#B99246]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#B99246]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-widest text-white">ELESENE</h2>
              <p className="text-[8px] font-futura tracking-[0.3em] text-white/40 uppercase mt-0.5">Privilege Card</p>
            </div>
            <span className="text-[8px] font-futura tracking-widest uppercase border border-[#B99246]/40 px-2.5 py-0.5 rounded-full font-bold bg-[#B99246]/10 text-[#B99246]">
              {tier.toUpperCase()}
            </span>
          </div>

          <div className="relative z-10 space-y-3">
            {/* Chip */}
            <div className="w-10 h-7 rounded bg-white/5 border border-white/10 overflow-hidden relative">
              <div className="absolute inset-x-3 inset-y-1 border-r border-l border-white/10" />
              <div className="absolute inset-y-2 inset-x-1 border-t border-b border-white/10" />
            </div>
            <p className="text-sm font-mono tracking-[0.25em] text-white/70 select-all">
              ELSN {points.toString().padStart(4, '0')} {String(user?.id || 0).padStart(4, '0')} 8923
            </p>
          </div>

          <div className="relative z-10 flex justify-between items-end border-t border-white/[0.08] pt-4">
            <div>
              <p className="text-[7px] font-futura tracking-widest uppercase text-white/40 mb-0.5">Cardholder</p>
              <p className="text-[11px] font-futura tracking-wider uppercase font-semibold text-white/80 truncate max-w-[180px]">
                {user?.full_name || 'ELESENE SHOPPER'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-futura tracking-widest uppercase text-white/40 mb-0.5">Point Balance</p>
              <p className="text-lg font-display font-bold text-white">
                {points.toLocaleString()}{' '}
                <span className="text-[10px] font-futura font-light text-[#B99246]">pts</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Benefits Breakdown ── */}
        <SectionCard className="flex-grow">
          <SectionHeader title="Elite Membership Benefits" subtitle="Exclusive privileges for ELESENE Club members." />
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
                title: '5× Point Multiplier',
                desc: 'Earn points faster on every couture order.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />,
                title: 'Priority Dressing',
                desc: 'Complimentary alterations & direct tailoring.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
                title: 'Private Showrooms',
                desc: 'Exclusive access to preview seasonal runways.'
              },
            ].map((b, i) => (
              <div key={i} className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#B99246]/8 border border-[#B99246]/20 flex items-center justify-center text-[#B99246]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    {b.icon}
                  </svg>
                </div>
                <div>
                  <h5 className="text-[10px] font-futura font-bold tracking-wider text-[#141414] uppercase">{b.title}</h5>
                  <p className="text-[10px] text-[#6F6F6F] font-futura font-light leading-relaxed mt-1">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-5">
            <p className="text-[9px] font-futura text-[#6F6F6F]/60 pt-4 border-t border-[#ECE8E1] leading-relaxed">
              Points expire after 12 months. Conversion is automatically applied at checkout.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 3. NOTIFICATIONS TAB                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
export const NotificationsTab = () => {
  const [notifications] = useState([
    {
      id: '1',
      title: 'Order Delivered',
      message: 'Your Linen Co-ord Set has been delivered to your saved address. Enjoy your purchase!',
      time: '1 day ago',
      type: 'success',
    },
    {
      id: '2',
      title: 'Special Insider Offer',
      message: 'Get 15% off on your next Atelier ring purchase using member code ATELIER15 at checkout.',
      time: '3 days ago',
      type: 'gold',
    },
    {
      id: '3',
      title: 'Concierge Verification',
      message: 'Your phone details were updated successfully.',
      time: '5 days ago',
      type: 'info',
    },
  ]);

  const typeConfig = {
    success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
    gold:    { dot: 'bg-[#B99246]',   bg: 'bg-[#B99246]/5 border-[#B99246]/15', icon: 'text-[#B99246]' },
    info:    { dot: 'bg-blue-500',    bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600' },
  };

  const typeIcons = {
    success: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    gold:    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.573.463a18.029 18.029 0 005.52-5.52c.409-.793.236-1.874-.464-2.573L9.568 3z" />,
    info:    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-[#141414] tracking-wide">Notifications</h2>
        <p className="text-xs text-[#6F6F6F] mt-1 font-futura">Stay updated on deliveries and exclusive club invites.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex gap-4 items-start p-4 rounded-2xl border ${cfg.bg} transition-shadow hover:shadow-sm`}
            >
              <div className={`w-9 h-9 shrink-0 rounded-full bg-white border border-[#ECE8E1] flex items-center justify-center ${cfg.icon}`}>
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  {typeIcons[n.type]}
                </svg>
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-futura font-bold text-[#141414]">{n.title}</h4>
                  <span className="text-[9px] text-[#6F6F6F] font-futura shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-[#6F6F6F] leading-relaxed font-futura font-light">{n.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* 4. ACCOUNT SETTINGS TAB                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
export const AccountSettingsTab = () => {
  const { user, updateUser } = useCustomerAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { values, setValues, errors, touched, validateForm, getFieldProps } = useFormValidation(
    { full_name: user?.full_name || '', phone: user?.phone || '' },
    (vals) => {
      const errs = {};
      if (!vals.full_name?.trim()) errs.full_name = 'Full name is required.';
      return errs;
    }
  );

  const { values: pwValues, errors: pwErrors, touched: pwTouched, validateForm: validatePwForm, getFieldProps: getPwFieldProps, resetForm: resetPwForm } = useFormValidation(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    (vals) => {
      const errs = {};
      if (!vals.currentPassword) errs.currentPassword = 'Current password is required.';
      if (!vals.newPassword) errs.newPassword = 'New password is required.';
      else if (vals.newPassword.length < 6) errs.newPassword = 'Minimum 6 characters.';
      if (vals.newPassword !== vals.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
      return errs;
    }
  );

  useEffect(() => {
    if (user) setValues({ full_name: user.full_name || '', phone: user.phone || '' });
  }, [user, setValues]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile({ full_name: values.full_name, phone: values.phone });
      if (updatedUser) updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    if (!validatePwForm()) return;
    setLoading(true);
    try {
      await changePassword(pwValues.currentPassword, pwValues.newPassword);
      setSuccessMsg('Password changed successfully.');
      resetPwForm();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-8 text-left max-w-2xl">
      <div>
        <h2 className="text-xl font-display font-semibold text-[#141414] tracking-wide">Account Settings</h2>
        <p className="text-xs text-[#6F6F6F] mt-1 font-futura">Update your personal information and security preferences.</p>
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-futura"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </motion.div>
      )}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-futura"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {errorMsg}
        </motion.div>
      )}

      {/* ── Profile Section ── */}
      <SectionCard>
        <SectionHeader title="Profile Information" subtitle="Your name and contact details." />
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-5" noValidate>
          <div className="space-y-4">
            <div>
              <FieldLabel>Full Name *</FieldLabel>
              <FieldInput
                type="text"
                error={errors.full_name && touched.full_name}
                {...getFieldProps('full_name', 'settings-fullname')}
              />
              {errors.full_name && touched.full_name && (
                <p className="text-[10px] font-futura text-red-500 mt-1.5">{errors.full_name}</p>
              )}
            </div>
            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <FieldInput
                type="tel"
                placeholder="+91 98765 43210"
                {...getFieldProps('phone', 'settings-phone')}
              />
            </div>
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <input
                id="settings-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#F5F4F2] border border-[#ECE8E1] rounded-xl px-4 py-3 text-[#6F6F6F] text-xs font-futura cursor-not-allowed"
              />
              <p className="mt-1.5 text-[9px] font-futura text-[#6F6F6F]/70">Email cannot be changed. Contact concierge for help.</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#141414] hover:bg-[#B99246] text-white text-xs font-futura font-bold tracking-wider uppercase rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,.14)' }}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </SectionCard>

      {/* ── Password Section ── */}
      <SectionCard>
        <SectionHeader title="Change Password" subtitle="Keep your account secure with a strong password." />
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5" noValidate>
          <div className="space-y-4">
            <PwField
              id="current-password"
              label="Current Password *"
              show={showCurrentPw}
              onToggle={() => setShowCurrentPw(v => !v)}
              fieldProps={getPwFieldProps('currentPassword', 'current-password')}
              error={pwErrors.currentPassword}
              touched={pwTouched.currentPassword}
            />
            <PwField
              id="new-password"
              label="New Password *"
              show={showNewPw}
              onToggle={() => setShowNewPw(v => !v)}
              fieldProps={getPwFieldProps('newPassword', 'new-password')}
              error={pwErrors.newPassword}
              touched={pwTouched.newPassword}
            />
            <PwField
              id="confirm-new-password"
              label="Confirm New Password *"
              show={showConfirmPw}
              onToggle={() => setShowConfirmPw(v => !v)}
              fieldProps={getPwFieldProps('confirmPassword', 'confirm-new-password')}
              error={pwErrors.confirmPassword}
              touched={pwTouched.confirmPassword}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#141414] hover:bg-[#B99246] text-white text-xs font-futura font-bold tracking-wider uppercase rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,.14)' }}
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </SectionCard>
    </div>
  );
};
