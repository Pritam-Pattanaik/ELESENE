import { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { initiateOrder, verifyPayment, applyCoupon } from '../../api/orders';
import { getAddresses, addAddress } from '../../api/user';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SEO from '../../components/layout/SEO';
import EmptyState from '../../components/common/EmptyState';
import { AddressSkeletonGrid } from '../../components/common/Skeleton';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/currency';

import useFormValidation from '../../hooks/useFormValidation';
import CelebrationModal from '../../components/investment/CelebrationModal';

const CheckoutPage = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useCustomerAuthStore();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(null);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  const {
    values: addressValues,
    errors: addressErrors,
    touched: addressTouched,
    validateForm: validateAddressForm,
    getFieldProps: getAddressFieldProps,
    resetForm: resetAddressForm
  } = useFormValidation(
    {
      label: 'Home',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      is_default: false
    },
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

  // Coupon States
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const subtotal = getCartTotal();
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = discountedSubtotal > 999 ? 0 : 99;
  const tax = Math.round(discountedSubtotal * 0.18);
  const total = discountedSubtotal + shipping + tax;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponMsg(null);

    try {
      const res = await applyCoupon({
        coupon_code: couponCodeInput.trim(),
        cart_items: items,
        subtotal
      });

      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discount_amount || 0);
      setCouponMsg(res.message || 'Coupon applied successfully!');
    } catch (err) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput('');
    setCouponMsg(null);
    setCouponError(null);
  };

  // Load Addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses();
        setAddresses(data || []);
        
        // Select default address initially, or first one
        if (data && data.length > 0) {
          const defaultAddr = data.find(a => a.is_default);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-noir flex flex-col justify-between selection:bg-gold/40 selection:text-white">
        <SEO title="Checkout" description="Complete your luxury fashion purchase securely." />
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-32 max-w-xl mx-auto w-full">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="Your Bag is Empty"
            description="You must add items to your shopping bag before proceeding to checkout."
            primaryAction={{
              label: "Explore Collection",
              to: "/shop"
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;
    
    try {
      const added = await addAddress(addressValues);
      setAddresses(prev => [...prev, added]);
      setSelectedAddressId(added.id);
      setShowAddressForm(false);
      resetAddressForm();
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Initiate order on backend
      const res = await initiateOrder({ 
        address_id: selectedAddressId, 
        notes: 'Handle with care',
        coupon_code: appliedCoupon?.code || undefined
      });

      if (!res.success) throw new Error(res.message);

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const razorpayKey = res.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TMQq9wmG77ZzLQ';

      if (!razorpayKey || razorpayKey.includes('placeholder') || razorpayKey.includes('XXXXX')) {
        throw new Error('Payment gateway configuration error: Razorpay Key is missing or invalid.');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: res.razorpayOrder.amount,
        currency: res.razorpayOrder.currency,
        name: 'ELESENE',
        description: 'Luxury Apparel Purchase',
        order_id: res.razorpayOrder.id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              clearCart();
              setOrderComplete(verifyRes.order);
              setStep(3); // Success step
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError(err.message);
          }
        },
        prefill: {
          name: selectedAddress?.full_name || user?.full_name || 'Shopper',
          email: user?.email || '',
          contact: selectedAddress?.phone || ''
        },
        theme: { color: '#0A0A0A' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-noir flex flex-col justify-between selection:bg-gold/40 selection:text-white">
        <SEO title="Purchase Confirmed" description="Thank you for shopping with ELESENE." />
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6 py-32">
          <div className="max-w-md w-full bg-white border border-black/10 p-8 rounded-2xl text-center space-y-6 shadow-xl">
            <div className="w-16 h-16 bg-gold/10 text-gold-light rounded-full flex items-center justify-center mx-auto text-3xl border border-gold/20 font-bold">
              ✓
            </div>
            <h1 className="text-3xl font-display text-ivory tracking-wide uppercase font-bold">Order Confirmed!</h1>
            <p className="text-ivory/80 font-futura text-sm font-medium">Your order #{orderComplete.order_number} has been placed successfully.</p>
            <p className="text-ivory/70 text-xs font-futura">We have sent a confirmation email along with shipping and tracking updates.</p>
            <Link to="/shop" className="inline-block mt-4 px-8 py-3 bg-ivory text-white rounded-xl font-futura font-bold tracking-widest uppercase hover:bg-gold hover:text-noir transition-colors duration-300 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Continue Shopping</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir py-28 sm:py-32 text-ivory">
      <SEO title="Checkout" description="Secure payment and checkout for ELESENE catalog items." />
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 grid lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column - Steps */}
        <div className="lg:col-span-7 space-y-8">
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-wide uppercase mb-8">Checkout</h1>
          
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl font-futura text-sm font-bold">{error}</div>}

          {/* Step 1: Address Selection */}
          <div className={`p-6 border rounded-2xl transition-all duration-500 ${step === 1 ? 'bg-white border-gold shadow-md' : 'bg-white/60 border-black/10 opacity-70'}`}>
            <h2 className="text-xl font-display font-bold uppercase tracking-wider mb-6 flex justify-between">
              <span>1. Shipping Address</span>
              {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-futura text-gold-light font-bold uppercase tracking-widest hover:text-gold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Change</button>}
            </h2>
            
            {step === 1 && (
              <div className="space-y-6">
                {addressLoading ? (
                  <AddressSkeletonGrid count={2} />
                ) : addresses.length === 0 && !showAddressForm ? (
                  <div className="text-center py-6 border border-dashed border-black/15 rounded-xl bg-white">
                    <p className="text-sm text-ivory/70 font-futura mb-4">No shipping addresses saved.</p>
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="px-8 py-3.5 bg-ivory border border-ivory text-white hover:bg-gold hover:text-noir rounded-xl text-xs font-futura font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none"
                      style={{ minHeight: '48px' }}
                    >
                      Add New Address
                    </button>
                  </div>
                ) : !showAddressForm ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 relative ${
                            selectedAddressId === addr.id
                              ? 'border-gold bg-gold/5 shadow-sm'
                              : 'border-black/10 hover:border-gold/40 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-futura uppercase tracking-widest text-gold-light font-bold">{addr.label}</span>
                            {addr.is_default && <span className="text-[9px] font-futura uppercase text-ivory/70 font-bold">Default</span>}
                          </div>
                          <p className="font-futura font-bold text-sm text-ivory">{addr.full_name}</p>
                          <p className="text-ivory/70 text-xs mt-1 leading-relaxed font-medium">
                            {addr.address_line1}
                            {addr.address_line2 && `, ${addr.address_line2}`}
                            <br/>
                            {addr.city}, {addr.state} {addr.pincode}
                            <br/>
                            {addr.country}
                          </p>
                          <p className="text-ivory/70 text-xs mt-2 font-futura font-medium">Phone: {addr.phone}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                          onClick={() => setShowAddressForm(true)}
                          className="px-6 py-3.5 bg-white border-2 border-ivory/20 text-ivory hover:text-gold hover:border-gold/50 rounded-xl text-xs font-futura font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none"
                          style={{ minHeight: '48px' }}
                        >
                          Add Another Address
                        </button>
                      <button 
                        onClick={() => setStep(2)}
                        disabled={!selectedAddressId}
                        className="flex-1 py-4 bg-ivory text-white font-futura font-bold rounded-xl uppercase tracking-widest hover:bg-gold hover:text-noir transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold text-xs select-none"
                        style={{ minHeight: '52px' }}
                      >
                        CONTINUE TO PAYMENT
                      </button>
                    </div>
                  </div>
                ) : (
                  /* New Address Form */
                  <form onSubmit={handleAddAddress} className="space-y-6" noValidate>
                    <h3 className="text-sm font-futura uppercase tracking-wider text-gold-light font-bold mb-2">New Address Details</h3>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('label', 'chk-addr-label')}
                          placeholder=" "
                          className="premium-input focus:border-gold"
                        />
                        <label htmlFor="chk-addr-label" className="premium-label">Address Label (e.g. Home, Office) *</label>
                      </div>
                      
                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('full_name', 'chk-addr-fullname')}
                          placeholder=" "
                          className={`premium-input ${
                            addressErrors.full_name && addressTouched.full_name ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                          }`}
                        />
                        <label htmlFor="chk-addr-fullname" className="premium-label">Full Name *</label>
                        {addressErrors.full_name && addressTouched.full_name && (
                          <p id="chk-addr-fullname-error" className="text-[11px] font-futura text-red-500 mt-1.5">{addressErrors.full_name}</p>
                        )}
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="tel" 
                          {...getAddressFieldProps('phone', 'chk-addr-phone')}
                          placeholder=" "
                          className={`premium-input ${
                            addressErrors.phone && addressTouched.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                          }`}
                        />
                        <label htmlFor="chk-addr-phone" className="premium-label">Phone Number *</label>
                        {addressErrors.phone && addressTouched.phone && (
                          <p id="chk-addr-phone-error" className="text-[11px] font-futura text-red-500 mt-1.5">{addressErrors.phone}</p>
                        )}
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('address_line1', 'chk-addr-line1')}
                          placeholder=" "
                          className={`premium-input ${
                            addressErrors.address_line1 && addressTouched.address_line1 ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                          }`}
                        />
                        <label htmlFor="chk-addr-line1" className="premium-label">Address Line 1 *</label>
                        {addressErrors.address_line1 && addressTouched.address_line1 && (
                          <p id="chk-addr-line1-error" className="text-[11px] font-futura text-red-500 mt-1.5">{addressErrors.address_line1}</p>
                        )}
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('address_line2', 'chk-addr-line2')}
                          placeholder=" "
                          className="premium-input focus:border-gold"
                        />
                        <label htmlFor="chk-addr-line2" className="premium-label">Address Line 2 (Optional)</label>
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('city', 'chk-addr-city')}
                          placeholder=" "
                          className={`premium-input ${
                            addressErrors.city && addressTouched.city ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                          }`}
                        />
                        <label htmlFor="chk-addr-city" className="premium-label">City *</label>
                        {addressErrors.city && addressTouched.city && (
                          <p id="chk-addr-city-error" className="text-[11px] font-futura text-red-500 mt-1.5">{addressErrors.city}</p>
                        )}
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('state', 'chk-addr-state')}
                          placeholder=" "
                          className={`premium-input ${
                            addressErrors.state && addressTouched.state ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                          }`}
                        />
                        <label htmlFor="chk-addr-state" className="premium-label">State / Province *</label>
                        {addressErrors.state && addressTouched.state && (
                          <p id="chk-addr-state-error" className="text-[11px] font-futura text-red-500 mt-1.5">{addressErrors.state}</p>
                        )}
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('pincode', 'chk-addr-pincode')}
                          placeholder=" "
                          className={`premium-input ${
                            addressErrors.pincode && addressTouched.pincode ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
                          }`}
                        />
                        <label htmlFor="chk-addr-pincode" className="premium-label">Pincode / Zip *</label>
                        {addressErrors.pincode && addressTouched.pincode && (
                          <p id="chk-addr-pincode-error" className="text-[11px] font-futura text-red-500 mt-1.5">{addressErrors.pincode}</p>
                        )}
                      </div>

                      <div className="premium-input-group">
                        <input 
                          type="text" 
                          {...getAddressFieldProps('country', 'chk-addr-country')}
                          placeholder=" "
                          className="premium-input focus:border-gold"
                        />
                        <label htmlFor="chk-addr-country" className="premium-label">Country *</label>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4 border-t border-black/5 mt-6">
                      <button 
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-6 py-3.5 bg-white border-2 border-ivory/20 text-ivory hover:text-gold hover:border-gold/50 rounded-xl text-xs font-futura font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none"
                        style={{ minHeight: '48px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-ivory text-white font-futura font-bold rounded-xl uppercase tracking-widest hover:bg-gold hover:text-noir transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold text-xs select-none"
                        style={{ minHeight: '52px' }}
                      >
                        Save & Select Address
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`p-6 border rounded-2xl transition-all duration-500 ${step === 2 ? 'bg-white border-gold shadow-md' : 'bg-white/60 border-black/10 opacity-70'}`}>
            <h2 className="text-xl font-display font-bold uppercase tracking-wider mb-6">2. Payment</h2>
            {step === 2 && (
              <div className="space-y-6">
                <div className="p-4 border border-black/10 bg-white rounded-xl">
                  <h4 className="text-xs font-futura uppercase tracking-widest text-gold-light font-bold mb-2">Shipping to:</h4>
                  <p className="font-futura text-sm text-ivory font-bold">{selectedAddress?.full_name}</p>
                  <p className="text-ivory/70 text-xs mt-1 font-medium">
                    {selectedAddress?.address_line1}, {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.pincode}
                  </p>
                </div>
                
                <p className="text-ivory/70 font-light text-xs leading-relaxed">
                  All transactions are secure and encrypted. Initiating payments will open a secure Razorpay window. Please do not close the window until verification is complete.
                </p>

<button 
                      onClick={handleInitiatePayment}
                      disabled={loading}
                      className="w-full py-4 bg-ivory hover:bg-gold text-white hover:text-noir font-futura font-bold rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 flex justify-center items-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none"
                      style={{ minHeight: '52px' }}
                    >
                  {loading ? 'Processing Transaction...' : `Pay ${formatCurrency(total, { context: 'Checkout Payment Button' })} securely with Razorpay`}
                </button>
                <button 
                  onClick={() => setStep(1)} 
                  className="w-full py-2 text-ivory/70 hover:text-ivory text-xs font-futura uppercase tracking-widest transition-colors font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Back to Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-black/10 p-6 rounded-2xl sticky top-32 shadow-md">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider mb-6 pb-4 border-b border-black/5">Order Summary ({items.length} items)</h2>
            
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-black/10">
              {items.map(item => {
                const primaryImage = item.Product?.images?.[0]?.image_url || '';
                const imageUrl = getImageUrl(primaryImage);
                const itemTotalPrice = (item.ProductVariant?.additional_price 
                  ? Number(item.Product.base_price) + Number(item.ProductVariant.additional_price)
                  : Number(item.Product.base_price)) * item.quantity;
                
                return (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-noir/5 rounded-lg overflow-hidden flex-shrink-0 border border-black/5">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.Product?.name ? `${item.Product.name} thumbnail` : 'Product thumbnail'} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full bg-black/5 flex items-center justify-center text-[9px] text-ivory/30 font-futura">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 text-xs space-y-1">
                      <p className="font-futura font-bold text-ivory tracking-wide">{item.Product?.name}</p>
                      {item.ProductVariant && (
                        <p className="text-ivory/70 font-medium">{item.ProductVariant.color} / {item.ProductVariant.size}</p>
                      )}
                      <p className="text-ivory/70 font-medium">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-futura text-ivory/80 font-bold">
                      {formatCurrency(itemTotalPrice, { context: 'Checkout Item Summary' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Application Box */}
            <div className="py-4 border-t border-b border-black/5 mb-6">
              <label htmlFor="checkout-coupon-code" className="block text-[10px] font-futura tracking-widest uppercase text-ivory/70 font-bold mb-2">Promo / Privilege Code</label>
              
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="checkout-coupon-code"
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    aria-describedby={couponError ? 'checkout-coupon-code-error' : undefined}
                    className="flex-1 bg-transparent border-b border-black/15 text-ivory text-xs py-2 focus:outline-none focus:border-gold font-futura uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-gold"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-6 py-3 bg-ivory text-white hover:bg-gold hover:text-noir text-xs font-futura uppercase tracking-widest rounded-xl font-bold transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold select-none"
                    style={{ minHeight: '48px' }}
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              ) : (
                <div className="flex justify-between items-center bg-gold/10 border border-gold/30 p-3 rounded-xl">
                  <div>
                    <span className="text-xs font-futura font-bold text-gold-light tracking-wider uppercase block">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-green-600 font-futura font-bold">
                      Saved {formatCurrency(discountAmount, { context: 'Checkout Coupon Savings' })}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-futura text-red-500 hover:text-red-700 uppercase font-bold tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && <p id="checkout-coupon-code-error" className="text-xs text-red-500 font-futura mt-2 font-medium">{couponError}</p>}
              {couponMsg && !couponError && <p className="text-xs text-green-600 font-futura mt-2 font-medium">{couponMsg}</p>}
            </div>

            <div className="space-y-3 text-xs font-futura">
              <div className="flex justify-between text-ivory/70">
                <span>Subtotal</span>
                <span className="text-ivory font-bold">{formatCurrency(subtotal, { context: 'Checkout Subtotal' })}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>- {formatCurrency(discountAmount, { context: 'Checkout Discount' })}</span>
                </div>
              )}

              <div className="flex justify-between text-ivory/70">
                <span>Shipping</span>
                <span className="text-ivory font-bold">{shipping === 0 ? 'Free' : formatCurrency(shipping, { context: 'Checkout Shipping' })}</span>
              </div>
              
              <div className="flex justify-between text-ivory/70">
                <span>Estimated Tax (18% GST)</span>
                <span className="text-ivory font-medium">{formatCurrency(tax, { context: 'Checkout Tax' })}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-display font-bold uppercase tracking-wider text-ivory pt-4 mt-4 border-t border-black/5">
              <span>Total</span>
              <span className="text-gold">{formatCurrency(total, { context: 'Checkout Grand Total' })}</span>
            </div>

            {/* BRAND INVESTMENT CHECKOUT SUMMARY WIDGET */}
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-400">
                <span>✦ Brand Investment Earned</span>
                <span className="font-mono">+{total.toLocaleString()} IP</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-ivory/70">
                <span>Spendable Loyalty Points</span>
                <span className="font-mono text-emerald-400">+{Math.floor(total / 100)} LP</span>
              </div>
              <p className="text-[10px] text-ivory/50 italic pt-1 border-t border-white/5">
                Invest in ELESENE: Increases your lifetime standing towards the next privilege tier.
              </p>
            </div>
          </div>
        </div>

      </div>

      <CelebrationModal
        isOpen={!!orderComplete}
        onClose={() => setOrderComplete(null)}
        ipEarned={total}
        lpEarned={Math.floor(total / 100)}
        newTier={user?.investmentTier || 'Seed'}
        tierUpgraded={false}
      />

      <Footer />
    </div>
  );
};

export default CheckoutPage;
