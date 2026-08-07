import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../../api/user';
import { AddressSkeletonGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import useFormValidation from '../../hooks/useFormValidation';

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const initialForm = {
    label: '', full_name: '', phone: '', address_line1: '', address_line2: '', 
    city: '', state: '', pincode: '', country: 'India', is_default: false
  };

  const {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    validateForm,
    getFieldProps,
    resetForm
  } = useFormValidation(
    initialForm,
    (vals) => {
      const errs = {};
      if (!vals.full_name || !vals.full_name.trim()) errs.full_name = 'Full name is required.';
      if (!vals.phone || !vals.phone.trim()) errs.phone = 'Phone number is required.';
      if (!vals.address_line1 || !vals.address_line1.trim()) errs.address_line1 = 'Address line 1 is required.';
      if (!vals.city || !vals.city.trim()) errs.city = 'City is required.';
      if (!vals.state || !vals.state.trim()) errs.state = 'State / Province is required.';
      if (!vals.pincode || !vals.pincode.trim()) errs.pincode = 'Pincode is required.';
      if (!vals.country || !vals.country.trim()) errs.country = 'Country is required.';
      return errs;
    }
  );

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAddresses()
      .then(data => {
        if (isMounted) setAddresses(data || []);
      })
      .catch(err => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleEdit = (address) => {
    setValues({
      label: address.label || '',
      full_name: address.full_name || '',
      phone: address.phone || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India',
      is_default: !!address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete address');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateAddress(editingId, values);
      } else {
        await addAddress(values);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchAddresses();
    } catch (err) {
      setFormError(err.message || 'Failed to save address');
    }
  };

  if (loading) return <AddressSkeletonGrid count={2} />;

  if (error) {
    return <ErrorState error={error} context="general" onRetry={fetchAddresses} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-h4 font-bold text-ivory uppercase tracking-wider">Saved Addresses</h2>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setEditingId(null); setShowForm(true); setFormError(null); }}
            className="flex items-center gap-2 text-xs font-futura tracking-widest uppercase text-gold hover:text-gold-light transition-colors duration-300 font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold py-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Shipping Address
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
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-6 md:p-8 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-display font-bold text-[#141414]">{editingId ? 'Edit Shipping Address' : 'New Shipping Address'}</h3>
                <button 
                  onClick={() => setShowForm(false)} 
                  aria-label="Close address form"
                  className="text-[#6F6F6F] hover:text-[#B99246] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99246] rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && <div className="mb-6 p-4 bg-red-500/10 text-red-600 text-sm font-futura rounded-xl border border-red-500/20">{formError}</div>}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="addr-label" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Label (e.g. Home, Work)</label>
                    <input 
                      type="text" 
                      {...getFieldProps('label', 'addr-label')}
                      placeholder="e.g. Home"
                      className="w-full bg-[#FAF9F7] border border-[#E8E5DF] rounded-xl px-4 py-3 text-[#141414] text-sm font-futura placeholder:text-[#909090] focus:outline-none focus:border-[#B99246] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#B99246]" 
                    />
                  </div>
                  <div className="hidden md:block"></div>
                  
                  <div>
                    <label htmlFor="addr-fullname" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Full Name *</label>
                    <input 
                      type="text" 
                      {...getFieldProps('full_name', 'addr-fullname')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.full_name && touched.full_name ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.full_name && touched.full_name && (
                      <p id="addr-fullname-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.full_name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="addr-phone" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Phone Number *</label>
                    <input 
                      type="tel" 
                      {...getFieldProps('phone', 'addr-phone')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.phone && touched.phone ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.phone && touched.phone && (
                      <p id="addr-phone-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="addr-line1" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Address Line 1 *</label>
                    <input 
                      type="text" 
                      {...getFieldProps('address_line1', 'addr-line1')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.address_line1 && touched.address_line1 ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.address_line1 && touched.address_line1 && (
                      <p id="addr-line1-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.address_line1}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="addr-line2" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Address Line 2 (Optional)</label>
                    <input 
                      type="text" 
                      {...getFieldProps('address_line2', 'addr-line2')}
                      className="w-full bg-[#FAF9F7] border border-[#E8E5DF] rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none focus:border-[#B99246] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#B99246]" 
                    />
                  </div>

                  <div>
                    <label htmlFor="addr-city" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">City *</label>
                    <input 
                      type="text" 
                      {...getFieldProps('city', 'addr-city')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.city && touched.city ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.city && touched.city && (
                      <p id="addr-city-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="addr-state" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">State / Province *</label>
                    <input 
                      type="text" 
                      {...getFieldProps('state', 'addr-state')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.state && touched.state ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.state && touched.state && (
                      <p id="addr-state-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="addr-pincode" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Pincode *</label>
                    <input 
                      type="text" 
                      {...getFieldProps('pincode', 'addr-pincode')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.pincode && touched.pincode ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.pincode && touched.pincode && (
                      <p id="addr-pincode-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.pincode}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="addr-country" className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-2 font-bold">Country *</label>
                    <input 
                      type="text" 
                      {...getFieldProps('country', 'addr-country')}
                      className={`w-full bg-[#FAF9F7] border rounded-xl px-4 py-3 text-[#141414] text-sm font-futura focus:outline-none font-futura focus-visible:ring-2 focus-visible:ring-[#B99246] ${
                        errors.country && touched.country ? 'border-red-500' : 'border-[#E8E5DF] focus:border-[#B99246]'
                      }`}
                    />
                    {errors.country && touched.country && (
                      <p id="addr-country-error" className="text-[11px] font-futura text-red-500 mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_default"
                    name="is_default"
                    checked={values.is_default}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-[#E8E5DF] bg-[#FAF9F7] text-[#B99246] focus:ring-[#B99246] cursor-pointer"
                  />
                  <label htmlFor="is_default" className="text-xs font-futura text-[#141414] select-none cursor-pointer font-medium">
                    Set as default shipping address
                  </label>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-[#EFECE7]">
                  <button type="submit" className="px-6 py-2.5 bg-[#141414] text-white border border-[#141414] font-futura font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-[#B99246] hover:border-[#B99246] transition-colors duration-300 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99246]">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white border border-[#E8E5DF] text-[#141414] font-futura text-xs tracking-widest uppercase rounded-xl hover:bg-[#F5F4F2] transition-all duration-300 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99246]">
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
              <div className="col-span-full">
                <EmptyState
                  icon={
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  }
                  title="No Shipping Addresses"
                  description="Save your residence or preferred delivery destinations to enable express checkout on all future orders."
                  primaryAction={{
                    label: "Add Shipping Address",
                    onClick: () => { resetForm(); setEditingId(null); setShowForm(true); setFormError(null); }
                  }}
                />
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="relative bg-white border border-[#E8E5DF] rounded-2xl p-6 group hover:border-[#B99246]/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
                  {addr.is_default && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-[#B99246]/10 border-b border-l border-[#B99246]/20 rounded-bl-lg rounded-tr-2xl">
                      <span className="text-[8px] font-futura font-bold tracking-widest uppercase text-[#B99246]">Default</span>
                    </div>
                  )}
                  
                  <div className="mb-4 pr-16">
                    <h4 className="text-[#141414] font-display font-bold text-base mb-1.5 flex items-center gap-2">
                      {addr.full_name}
                      {addr.label && (
                        <span className="px-2 py-0.5 text-[8px] font-futura tracking-widest uppercase border border-[#E8E5DF] bg-[#FAF9F7] rounded-full text-[#6F6F6F] font-bold">
                          {addr.label}
                        </span>
                      )}
                    </h4>
                    <p className="text-[#6F6F6F] font-futura text-xs font-medium">{addr.phone}</p>
                  </div>
                  
                  <div className="text-[#6F6F6F] font-futura text-xs space-y-1 mb-6 min-h-[72px] leading-relaxed">
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                    <p>{addr.country}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-[#EFECE7]">
                    <button 
                      onClick={() => handleEdit(addr)}
                      className="text-[10px] font-futura tracking-wider text-[#6F6F6F] hover:text-[#B99246] uppercase transition-colors font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99246] rounded-sm"
                    >
                      Edit
                    </button>
                    <span className="text-[#E8E5DF]">•</span>
                    <button 
                      onClick={() => handleDelete(addr.id)}
                      className="text-[10px] font-futura tracking-wider text-[#D14343] hover:text-red-700 uppercase transition-colors font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99246] rounded-sm"
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



