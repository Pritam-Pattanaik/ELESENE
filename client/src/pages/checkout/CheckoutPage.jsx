import { useState } from 'react';
import useCartStore from '../../store/cartStore';
import { initiateOrder, verifyPayment } from '../../api/orders';

const CheckoutPage = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(null);

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Initiate order on backend
      const res = await initiateOrder({ 
        address_id: 'mock-address-id-123', 
        notes: 'Handle with care' 
      });

      if (!res.success) throw new Error(res.message);

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_placeholder', // Should be from env
        amount: res.razorpayOrder.amount,
        currency: res.razorpayOrder.currency,
        name: 'ELESENE',
        description: 'Fashion Purchase',
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
          name: 'Jane Doe',
          email: 'jane@example.com',
          contact: '9999999999'
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

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-display text-noir">Order Confirmed!</h1>
          <p className="text-slate-600">Your order #{orderComplete.order_number} has been placed successfully.</p>
          <a href="/" className="inline-block mt-4 px-6 py-3 bg-noir text-ivory rounded font-medium">Continue Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12">
        
        {/* Left Column - Steps */}
        <div className="md:col-span-7 space-y-8">
          <h1 className="text-3xl font-display text-noir tracking-wide uppercase">Checkout</h1>
          
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded">{error}</div>}

          {/* Step 1: Address (Mocked for now) */}
          <div className={`p-6 border rounded-lg ${step === 1 ? 'bg-white border-noir shadow-sm' : 'bg-transparent border-slate-300 opacity-60'}`}>
            <h2 className="text-xl font-medium mb-4 flex justify-between">
              <span>1. Shipping Address</span>
              {step > 1 && <button onClick={() => setStep(1)} className="text-sm text-gold">Edit</button>}
            </h2>
            {step === 1 && (
              <div className="space-y-4">
                <div className="p-4 border border-gold bg-amber-50/50 rounded cursor-pointer">
                  <p className="font-medium text-noir">Jane Doe</p>
                  <p className="text-slate-600 text-sm mt-1">123 Fashion Street, Bandra West<br/>Mumbai, Maharashtra 400050<br/>+91 99999 99999</p>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-noir text-ivory font-medium rounded hover:bg-slate-800"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`p-6 border rounded-lg ${step === 2 ? 'bg-white border-noir shadow-sm' : 'bg-transparent border-slate-300 opacity-60'}`}>
            <h2 className="text-xl font-medium mb-4">2. Payment</h2>
            {step === 2 && (
              <div className="space-y-6">
                <p className="text-slate-600">All transactions are secure and encrypted via Razorpay.</p>
                <button 
                  onClick={handleInitiatePayment}
                  disabled={loading}
                  className="w-full py-4 bg-[#3395FF] text-white font-medium rounded shadow-md hover:bg-[#2083EC] disabled:opacity-70 transition-colors flex justify-center items-center gap-2"
                >
                  {loading ? 'Processing...' : `Pay ₹${total} securely with Razorpay`}
                </button>
                <button onClick={() => setStep(1)} className="w-full py-2 text-slate-500 hover:text-noir text-sm">
                  Back to Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6 border border-slate-100">
            <h2 className="text-xl font-medium mb-6">Order Summary ({items.length} items)</h2>
            
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-slate-100 rounded object-cover flex-shrink-0"></div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.Product?.name}</p>
                    <p className="text-slate-500 mt-1">{item.ProductVariant?.color} / {item.ProductVariant?.size}</p>
                    <p className="text-slate-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-200 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (18%)</span>
                <span>₹{tax}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-medium text-noir pt-4 mt-4 border-t border-slate-200">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
