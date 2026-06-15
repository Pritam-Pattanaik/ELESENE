import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../../api/user';

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const initialForm = {
    label: '', full_name: '', phone: '', address_line1: '', address_line2: '', 
    city: '', state: '', pincode: '', country: 'UK', is_default: false
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setForm(address);
    setEditingId(address.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await addAddress(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      fetchAddresses(); // refresh list to ensure defaults are correctly applied visually
    } catch (err) {
      setError(err.message || 'Failed to save address');
    }
  };

  if (loading) return <div className="text-ivory/50 font-futura tracking-wider animate-pulse">Loading addresses...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-futura tracking-wider text-ivory uppercase">Saved Addresses</h2>
        {!showForm && (
          <button 
            onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 text-sm font-futura tracking-wider uppercase text-gold hover:text-white transition-colors duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Address
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-display font-bold text-ivory">{editingId ? 'Edit Address' : 'New Address'}</h3>
                <button onClick={() => setShowForm(false)} className="text-ivory/50 hover:text-ivory">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && <div className="mb-6 p-4 bg-red-500/10 text-red-400 text-sm font-futura rounded-lg border border-red-500/20">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Label (e.g. Home, Work)</label>
                    <input type="text" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>
                  <div className="hidden md:block"></div>
                  
                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Full Name *</label>
                    <input type="text" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Phone Number *</label>
                    <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Address Line 1 *</label>
                    <input type="text" required value={form.address_line1} onChange={e => setForm({...form, address_line1: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Address Line 2 (Optional)</label>
                    <input type="text" value={form.address_line2} onChange={e => setForm({...form, address_line2: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">City *</label>
                    <input type="text" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">State / County *</label>
                    <input type="text" required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Postcode *</label>
                    <input type="text" required value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-2">Country *</label>
                    <input type="text" required value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-4 py-3 text-ivory text-sm font-futura" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_default"
                    checked={form.is_default}
                    onChange={e => setForm({...form, is_default: e.target.checked})}
                    className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.02] text-gold focus:ring-gold focus:ring-offset-noir"
                  />
                  <label htmlFor="is_default" className="text-sm font-futura text-ivory/70 select-none cursor-pointer">
                    Set as default shipping address
                  </label>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/[0.06]">
                  <button type="submit" className="px-6 py-2.5 bg-gold text-noir font-futura font-bold text-xs tracking-widest uppercase rounded-lg hover:bg-white transition-colors duration-300">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/[0.05] border border-white/[0.1] text-ivory font-futura text-xs tracking-widest uppercase rounded-lg hover:bg-white/[0.1] transition-all duration-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {addresses.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white/[0.01] border border-white/[0.04] rounded-2xl">
                <p className="text-ivory/50 font-futura mb-4">You haven't saved any addresses yet.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="relative bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 group hover:border-gold/30 transition-colors duration-300">
                  {addr.is_default && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gold/10 border-b border-l border-gold/20 rounded-bl-lg rounded-tr-xl">
                      <span className="text-[9px] font-futura font-bold tracking-widest uppercase text-gold">Default</span>
                    </div>
                  )}
                  
                  <div className="mb-4 pr-16">
                    <h4 className="text-ivory font-display font-bold mb-1 flex items-center gap-2">
                      {addr.full_name}
                      {addr.label && (
                        <span className="px-2 py-0.5 text-[9px] font-futura tracking-widest uppercase border border-white/[0.1] rounded-full text-ivory/50">
                          {addr.label}
                        </span>
                      )}
                    </h4>
                    <p className="text-ivory/60 font-futura text-sm">{addr.phone}</p>
                  </div>
                  
                  <div className="text-ivory/50 font-futura text-sm space-y-1 mb-6 min-h-[80px]">
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                    <p>{addr.country}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                    <button 
                      onClick={() => handleEdit(addr)}
                      className="text-xs font-futura tracking-wider text-ivory hover:text-gold uppercase transition-colors"
                    >
                      Edit
                    </button>
                    <span className="text-white/[0.1]">•</span>
                    <button 
                      onClick={() => handleDelete(addr.id)}
                      className="text-xs font-futura tracking-wider text-red-400/70 hover:text-red-400 uppercase transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressesPage;
