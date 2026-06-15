import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserOrders } from '../../api/orders';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-ivory/50 font-futura tracking-wider animate-pulse">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-400 font-futura">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-white/[0.04] rounded-2xl bg-white/[0.01]">
        <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-ivory/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-display font-bold text-ivory mb-2">No Orders Yet</h2>
        <p className="text-ivory/50 font-futura mb-8">You haven't placed any orders with ELESENE.</p>
        <Link 
          to="/shop"
          className="px-8 py-3 bg-gold text-noir font-futura font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-white transition-colors duration-300"
        >
          Discover Collection
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'shipped': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gold bg-gold/10 border-gold/20';
    }
  };

  return (
    <div>
      <h2 className="text-lg font-futura tracking-wider text-ivory mb-6 uppercase">Order History</h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <span className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-1">Order Number</span>
                  <span className="text-ivory font-futura tracking-wide">{order.order_number}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-1">Date</span>
                  <span className="text-ivory/70 font-futura">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-futura tracking-[0.2em] uppercase text-ivory/30 mb-1">Total</span>
                  <span className="text-gold font-futura tracking-wider">£{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <span className={`inline-flex px-3 py-1 text-xs font-futura tracking-wider uppercase border rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {order.OrderItems?.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-white/[0.02] rounded overflow-hidden flex-shrink-0">
                    {item.Product?.images?.[0] ? (
                      <img src={`http://localhost:3000${item.Product.images[0].image_url}`} alt={item.Product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/[0.05]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-ivory font-futura text-sm truncate">{item.Product?.name || 'Unknown Product'}</h4>
                    <p className="text-ivory/50 font-futura text-xs mt-1">
                      {item.ProductVariant?.color && `Color: ${item.ProductVariant.color}`}
                      {item.ProductVariant?.size && ` | Size: ${item.ProductVariant.size}`}
                    </p>
                    <p className="text-ivory/50 font-futura text-xs mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-ivory font-futura tracking-wider text-sm">£{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {order.tracking_number && (
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-xs font-futura text-ivory/50 uppercase tracking-widest">
                  Tracking: <span className="text-ivory">{order.tracking_number}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
