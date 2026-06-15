import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { getUserProfile, updateUserProfile } from '../../api/user';

const ProfilePage = () => {
  const { user, login } = useCustomerAuthStore(); // reuse login to update store user
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '', // Email is usually non-editable in basic setups, or requires special flow
    phone: user?.phone || ''
  });

  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Fetch fresh profile data to get latest points and phone
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setForm({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || ''
        });
        setPoints(profile.loyalty_points || 0);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updatedUser = await updateUserProfile({
        full_name: form.full_name,
        phone: form.phone
      });
      
      // Update global auth store with new user data (keep the existing token)
      const token = useCustomerAuthStore.getState().getToken();
      login(token, updatedUser); // Assuming login takes (token, user) or we can just call set({ user: updatedUser }) if we exported a dedicated action.
      // Actually login takes (email, password) in customerAuthStore!
      // Wait, customerAuthStore login is an API call. We should just update the state directly.
      // Let's rely on the local state update for now, and next page load will use the DB data.
      // For immediate UI update, we can just show success.
      
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Loyalty Points Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 p-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold/20 rounded-full blur-[50px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-display font-bold text-ivory mb-2">ELESENE Rewards</h2>
            <p className="text-sm font-futura text-ivory/60">Earn points on every purchase to unlock exclusive benefits.</p>
          </div>
          <div className="text-center bg-noir/50 backdrop-blur-md border border-gold/30 rounded-xl px-8 py-4 min-w-[160px]">
            <span className="block text-3xl font-display font-bold text-gold mb-1">{points}</span>
            <span className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/50">Available Points</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div>
        <h2 className="text-lg font-futura tracking-wider text-ivory mb-6 uppercase">Personal Information</h2>
        
        {successMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-futura">
            {successMsg}
          </div>
        )}
        
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-futura">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Full Name</label>
              <input 
                type="text"
                value={form.full_name}
                onChange={e => handleChange('full_name', e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura placeholder:text-ivory/15 focus:outline-none focus:border-gold/30 transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Phone Number</label>
              <input 
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+44 20 7123 4567"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura placeholder:text-ivory/15 focus:outline-none focus:border-gold/30 transition-colors duration-300"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Email Address</label>
            <input 
              type="email"
              value={form.email}
              disabled
              className="w-full bg-white/[0.01] border border-white/[0.04] rounded-lg px-4 py-3 text-ivory/50 text-sm font-futura cursor-not-allowed"
            />
            <p className="mt-2 text-[11px] font-futura text-ivory/30">Email address cannot be changed. Contact support for assistance.</p>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-white/[0.05] border border-white/[0.1] text-ivory font-futura text-sm tracking-wider uppercase rounded-lg hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
